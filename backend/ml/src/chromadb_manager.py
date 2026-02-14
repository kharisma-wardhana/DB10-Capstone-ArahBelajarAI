"""ChromaDB connection and collection management for skill taxonomy and job titles."""

import hashlib
import json
from typing import Optional

import chromadb
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

from ml.src.config import (
    CHROMA_HOST,
    CHROMA_PORT,
    EMBEDDING_MODEL_NAME,
    JOB_SKILL_MAPPING_PATH,
    JOB_TITLE_COLLECTION_NAME,
    NOISE_SKILLS,
    SKILL_COLLECTION_NAME,
    SKILL_EMBEDDINGS_PATH,
    SKILL_FREQUENCY_MIN_RATIO,
    SKILL_TAXONOMY_CATEGORIZED_PATH,
)


def get_chroma_client(
    host: str = CHROMA_HOST,
    port: int = CHROMA_PORT,
) -> chromadb.HttpClient:
    """Connect to a running ChromaDB instance."""
    return chromadb.HttpClient(host=host, port=port)


def get_ephemeral_client() -> chromadb.EphemeralClient:
    """Create an in-memory ChromaDB client (for notebooks/testing)."""
    return chromadb.EphemeralClient()


# ---------------------------------------------------------------------------
# Skill Taxonomy Collection
# ---------------------------------------------------------------------------

def populate_skill_collection(
    client: chromadb.ClientAPI,
    taxonomy_path: Optional[str] = None,
    embeddings_path: Optional[str] = None,
    collection_name: str = SKILL_COLLECTION_NAME,
) -> chromadb.Collection:
    """Create and populate the skill_taxonomy collection.

    Uses pre-computed embeddings from skill_embeddings.parquet so no model
    inference is needed.

    Args:
        client: ChromaDB client.
        taxonomy_path: Path to categorized taxonomy parquet.
        embeddings_path: Path to skill embeddings parquet.
        collection_name: Name for the collection.

    Returns:
        The populated ChromaDB collection.
    """
    tax_path = taxonomy_path or str(SKILL_TAXONOMY_CATEGORIZED_PATH)
    emb_path = embeddings_path or str(SKILL_EMBEDDINGS_PATH)

    taxonomy_df = pd.read_parquet(tax_path)
    embeddings_df = pd.read_parquet(emb_path)

    # Ensure embeddings have a skill name column (aligned by index with taxonomy)
    if "skill" not in embeddings_df.columns:
        embeddings_df.insert(0, "skill", taxonomy_df["skill_name"].values)

    # Build embedding lookup
    skill_col = "skill"
    emb_cols = [c for c in embeddings_df.columns if c != skill_col]
    skill_to_vec = {
        row[skill_col]: row[emb_cols].values.astype(np.float32).tolist()
        for _, row in embeddings_df.iterrows()
    }

    # Delete and recreate collection for idempotency
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
    collection = client.create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )

    # Batch upsert (ChromaDB recommends batches <= 5000)
    batch_size = 500
    ids, documents, embeddings, metadatas = [], [], [], []

    for _, row in taxonomy_df.iterrows():
        skill_name = row["skill_name"]
        vec = skill_to_vec.get(skill_name)
        if vec is None:
            continue

        ids.append(f"skill_{row['skill_id']}")
        documents.append(skill_name)
        embeddings.append(vec)
        metadatas.append({
            "skill_id": int(row["skill_id"]),
            "skill_name": skill_name,
            "category": row.get("category", "tech_skills"),
            "total_count": int(row.get("total_count", 0)),
        })

        if len(ids) >= batch_size:
            collection.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
            ids, documents, embeddings, metadatas = [], [], [], []

    if ids:
        collection.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)

    return collection


# ---------------------------------------------------------------------------
# Job Titles Collection
# ---------------------------------------------------------------------------

def _normalize_job_title(title: str) -> str:
    """Basic normalization for job titles."""
    if not isinstance(title, str):
        return ""
    import re
    t = title.strip().lower()
    t = re.sub(r"\s+", " ", t)
    # Remove common suffixes/prefixes that don't affect semantics
    t = re.sub(r"\s*\(.*?\)\s*", " ", t)  # remove parenthetical
    return t.strip()


def _aggregate_job_skills(
    job_skill_df: pd.DataFrame,
    min_jobs_per_title: int = 3,
    min_skill_ratio: float = SKILL_FREQUENCY_MIN_RATIO,
    noise_skills: frozenset = NOISE_SKILLS,
) -> dict[str, dict]:
    """Aggregate skills per normalized job title.

    Returns dict mapping normalized title -> {
        "job_count": int,
        "skills": [{"skill": str, "frequency": float, "count": int}, ...],
    }
    """
    df = job_skill_df.copy()
    df["job_title_normalized"] = df["job_title"].apply(_normalize_job_title)

    # Filter noise skills
    df = df[~df["skill"].isin(noise_skills)]

    # Group by title, compute stats
    title_groups = df.groupby("job_title_normalized")
    result = {}

    for title, group in title_groups:
        if not title:
            continue
        job_count = group["job_id"].nunique()
        if job_count < min_jobs_per_title:
            continue

        skill_counts = group.groupby("skill")["job_id"].nunique()
        skill_freq = (skill_counts / job_count).sort_values(ascending=False)

        # Filter by minimum frequency
        skill_freq = skill_freq[skill_freq >= min_skill_ratio]
        if skill_freq.empty:
            continue

        skills_list = [
            {"skill": skill, "frequency": round(float(freq), 4), "count": int(skill_counts[skill])}
            for skill, freq in skill_freq.head(30).items()
        ]

        result[title] = {
            "job_count": job_count,
            "skills": skills_list,
        }

    return result


def populate_job_title_collection(
    client: chromadb.ClientAPI,
    model: Optional[SentenceTransformer] = None,
    job_skill_path: Optional[str] = None,
    collection_name: str = JOB_TITLE_COLLECTION_NAME,
) -> tuple[chromadb.Collection, dict[str, dict]]:
    """Create and populate the job_titles collection.

    Args:
        client: ChromaDB client.
        model: SentenceTransformer model for encoding titles.
        job_skill_path: Path to job_skill_mapping parquet.
        collection_name: Collection name.

    Returns:
        Tuple of (collection, job_title_skills_dict).
    """
    if model is None:
        model = SentenceTransformer(EMBEDDING_MODEL_NAME)

    path = job_skill_path or str(JOB_SKILL_MAPPING_PATH)
    job_skill_df = pd.read_parquet(path)

    # Aggregate
    title_skills = _aggregate_job_skills(job_skill_df)

    # Delete and recreate
    try:
        client.delete_collection(collection_name)
    except Exception:
        pass
    collection = client.create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"},
    )

    # Encode and upsert
    titles = list(title_skills.keys())
    if not titles:
        return collection, title_skills

    title_embeddings = model.encode(titles, show_progress_bar=True, batch_size=64)

    batch_size = 500
    ids, documents, embeddings, metadatas = [], [], [], []

    for i, title in enumerate(titles):
        info = title_skills[title]
        title_hash = hashlib.md5(title.encode()).hexdigest()[:12]

        top_skills = [s["skill"] for s in info["skills"][:20]]

        ids.append(f"job_{title_hash}")
        documents.append(title)
        embeddings.append(title_embeddings[i].tolist())
        metadatas.append({
            "job_title_normalized": title,
            "job_count": info["job_count"],
            "skill_count": len(info["skills"]),
            "top_skills": json.dumps(top_skills),
        })

        if len(ids) >= batch_size:
            collection.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)
            ids, documents, embeddings, metadatas = [], [], [], []

    if ids:
        collection.add(ids=ids, documents=documents, embeddings=embeddings, metadatas=metadatas)

    return collection, title_skills


# ---------------------------------------------------------------------------
# Query Helpers
# ---------------------------------------------------------------------------

def query_skills(
    collection: chromadb.Collection,
    query_embeddings: list[list[float]],
    n_results: int = 5,
) -> list[list[dict]]:
    """Query the skill_taxonomy collection.

    Returns list of result lists, one per query embedding.
    Each result is a dict with 'skill_name', 'category', 'distance', 'similarity'.
    """
    results = collection.query(
        query_embeddings=query_embeddings,
        n_results=n_results,
        include=["metadatas", "distances", "documents"],
    )

    output = []
    for i in range(len(query_embeddings)):
        matches = []
        for j in range(len(results["ids"][i])):
            meta = results["metadatas"][i][j]
            dist = results["distances"][i][j]
            # ChromaDB cosine distance = 1 - similarity
            similarity = 1.0 - dist
            matches.append({
                "skill_name": meta["skill_name"],
                "skill_id": meta["skill_id"],
                "category": meta["category"],
                "distance": dist,
                "similarity": similarity,
            })
        output.append(matches)

    return output


def query_job_titles(
    collection: chromadb.Collection,
    query_embedding: list[float],
    n_results: int = 5,
) -> list[dict]:
    """Query the job_titles collection for similar job titles.

    Returns list of dicts with 'job_title', 'similarity', 'top_skills', etc.
    """
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        include=["metadatas", "distances", "documents"],
    )

    matches = []
    for j in range(len(results["ids"][0])):
        meta = results["metadatas"][0][j]
        dist = results["distances"][0][j]
        similarity = 1.0 - dist
        matches.append({
            "job_title": meta["job_title_normalized"],
            "similarity": similarity,
            "job_count": meta["job_count"],
            "skill_count": meta["skill_count"],
            "top_skills": json.loads(meta["top_skills"]),
        })

    return matches
