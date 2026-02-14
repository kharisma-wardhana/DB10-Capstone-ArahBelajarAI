"""Classify skills into 5 categories using seed-centroid embedding approach.

Categories:
- tech_skills: Technical/programming/tool skills
- soft_skills: Interpersonal and communication skills
- leadership: Management and leadership skills
- domain_knowledge: Industry/domain-specific knowledge
- adaptation_skills: Learning agility and adaptability skills
"""

import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

from ml.src.config import (
    CATEGORY_SEEDS,
    SKILL_EMBEDDINGS_PATH,
    SKILL_TAXONOMY_CATEGORIZED_PATH,
    SKILL_TAXONOMY_PATH,
)


def build_category_centroids(
    embeddings_df: pd.DataFrame,
    seeds: dict[str, list[str]] | None = None,
) -> dict[str, np.ndarray]:
    """Compute centroid embedding for each category from seed skills.

    Args:
        embeddings_df: DataFrame with 'skill' column and 384-dim embedding columns.
        seeds: Dict mapping category name to list of seed skill names.

    Returns:
        Dict mapping category name to centroid embedding vector.
    """
    seeds = seeds or CATEGORY_SEEDS

    # Build a lookup: skill_name -> embedding vector
    skill_col = "skill"
    embedding_cols = [c for c in embeddings_df.columns if c != skill_col]
    skill_to_vec = {
        row[skill_col]: row[embedding_cols].values.astype(np.float32)
        for _, row in embeddings_df.iterrows()
    }

    centroids: dict[str, np.ndarray] = {}
    for category, seed_skills in seeds.items():
        vectors = []
        for s in seed_skills:
            if s in skill_to_vec:
                vectors.append(skill_to_vec[s])
        if not vectors:
            raise ValueError(
                f"No seed skills found in embeddings for category '{category}'. "
                f"Check that seed names match taxonomy skill names."
            )
        centroids[category] = np.mean(vectors, axis=0)

    return centroids


def classify_skills(
    taxonomy_df: pd.DataFrame,
    embeddings_df: pd.DataFrame,
    centroids: dict[str, np.ndarray] | None = None,
) -> pd.DataFrame:
    """Assign a category to every skill in the taxonomy.

    Args:
        taxonomy_df: DataFrame with at least 'skill_name' column.
        embeddings_df: DataFrame with 'skill' column and embedding columns.
        centroids: Pre-computed centroids (optional; built from seeds if None).

    Returns:
        Copy of taxonomy_df with added 'category' and 'category_confidence' columns.
    """
    if centroids is None:
        centroids = build_category_centroids(embeddings_df)

    skill_col = "skill"
    embedding_cols = [c for c in embeddings_df.columns if c != skill_col]

    # Build lookup
    skill_to_vec = {
        row[skill_col]: row[embedding_cols].values.astype(np.float32)
        for _, row in embeddings_df.iterrows()
    }

    categories = list(centroids.keys())
    centroid_matrix = np.array([centroids[c] for c in categories])  # (5, 384)

    result = taxonomy_df.copy()
    cat_labels = []
    cat_confidences = []

    for _, row in result.iterrows():
        skill_name = row["skill_name"]
        vec = skill_to_vec.get(skill_name)
        if vec is None:
            cat_labels.append("tech_skills")  # default fallback
            cat_confidences.append(0.0)
            continue

        sims = cosine_similarity(vec.reshape(1, -1), centroid_matrix)[0]
        best_idx = int(np.argmax(sims))
        cat_labels.append(categories[best_idx])
        cat_confidences.append(float(sims[best_idx]))

    result["category"] = cat_labels
    result["category_confidence"] = cat_confidences
    return result


def save_categorized_taxonomy(
    taxonomy_df: pd.DataFrame,
    embeddings_df: pd.DataFrame,
    output_path: str | None = None,
) -> pd.DataFrame:
    """Classify skills and save the categorized taxonomy to parquet.

    Returns the categorized DataFrame.
    """
    categorized = classify_skills(taxonomy_df, embeddings_df)
    out = output_path or str(SKILL_TAXONOMY_CATEGORIZED_PATH)
    categorized.to_parquet(out, index=False)
    return categorized


def load_categorized_taxonomy() -> pd.DataFrame:
    """Load the categorized taxonomy from parquet."""
    return pd.read_parquet(SKILL_TAXONOMY_CATEGORIZED_PATH)
