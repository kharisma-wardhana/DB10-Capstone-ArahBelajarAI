"""Model 1: Skill Extractor — extract skills from text using semantic similarity.

Supports two input modes:
1. Comma-separated skill list (e.g., "Python, ML, Docker")
2. Free text paragraphs (e.g., CV/resume descriptions)

Uses a two-pass approach:
- Pass 1 (exact): Match normalized n-grams against skill taxonomy
- Pass 2 (semantic): Encode text with all-MiniLM-L6-v2, query ChromaDB
"""

import re
from dataclasses import asdict, dataclass

import chromadb
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

from ml.src.chromadb_manager import query_skills
from ml.src.config import (
    EMBEDDING_MODEL_NAME,
    NOISE_SKILLS,
    SKILL_COLLECTION_NAME,
    SKILL_HIGH_CONFIDENCE,
    SKILL_MATCH_THRESHOLD,
    SKILL_TAXONOMY_CATEGORIZED_PATH,
)
from ml.src.skill_normalizer import normalize_skill, parse_skills_csv, preprocess_text


@dataclass
class SkillMatch:
    """A single matched skill with metadata."""

    skill_name: str
    skill_id: int
    category: str
    confidence: float
    matched_from: str  # the input fragment that produced this match

    def to_dict(self) -> dict:
        return asdict(self)


class SkillExtractor:
    """Extract skills from text using exact + semantic matching.

    Args:
        chroma_client: ChromaDB client instance.
        model: SentenceTransformer model (loaded if None).
        threshold: Minimum cosine similarity to accept a match.
        taxonomy_path: Path to categorized taxonomy parquet.
        collection_name: ChromaDB collection name for skills.
    """

    def __init__(
        self,
        chroma_client: chromadb.ClientAPI,
        model: SentenceTransformer | None = None,
        threshold: float = SKILL_MATCH_THRESHOLD,
        taxonomy_path: str | None = None,
        collection_name: str = SKILL_COLLECTION_NAME,
    ):
        self.client = chroma_client
        self.model = model or SentenceTransformer(EMBEDDING_MODEL_NAME)
        self.threshold = threshold
        self.collection = chroma_client.get_collection(collection_name)

        # Load taxonomy for exact matching lookup
        tax_path = taxonomy_path or str(SKILL_TAXONOMY_CATEGORIZED_PATH)
        tax_df = pd.read_parquet(tax_path)
        self._skill_lookup: dict[str, dict] = {
            row["skill_name"]: {
                "skill_id": int(row["skill_id"]),
                "category": row.get("category", "tech_skills"),
            }
            for _, row in tax_df.iterrows()
        }
        self._skill_names = set(self._skill_lookup.keys())

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def extract_from_skill_list(self, skills_csv: str) -> list[SkillMatch]:
        """Extract skills from a comma-separated skill string.

        Steps:
        1. Split and normalize each skill
        2. Exact match against taxonomy
        3. Semantic match for non-exact items
        """
        normalized = parse_skills_csv(skills_csv)
        if not normalized:
            return []

        matches: list[SkillMatch] = []
        unmatched: list[str] = []

        for skill in normalized:
            if skill in self._skill_lookup:
                info = self._skill_lookup[skill]
                matches.append(SkillMatch(
                    skill_name=skill,
                    skill_id=info["skill_id"],
                    category=info["category"],
                    confidence=1.0,
                    matched_from=skill,
                ))
            else:
                unmatched.append(skill)

        # Semantic matching for unmatched skills
        if unmatched:
            embeddings = self.model.encode(unmatched).tolist()
            results = query_skills(self.collection, embeddings, n_results=1)
            for text, result_list in zip(unmatched, results):
                if result_list and result_list[0]["similarity"] >= self.threshold:
                    best = result_list[0]
                    matches.append(SkillMatch(
                        skill_name=best["skill_name"],
                        skill_id=best["skill_id"],
                        category=best["category"],
                        confidence=best["similarity"],
                        matched_from=text,
                    ))

        return self._deduplicate(matches)

    def extract_from_text(self, text: str) -> list[SkillMatch]:
        """Extract skills from free-form text (CV, resume, job description).

        Two-pass approach:
        1. Exact: Extract n-grams, normalize, match against taxonomy
        2. Semantic: Encode sentences, query ChromaDB for nearest skills
        """
        text = preprocess_text(text)
        if not text:
            return []

        # Split into sentences
        sentences = self._split_sentences(text)

        all_matches: list[SkillMatch] = []
        sentences_without_exact: list[str] = []

        # Pass 1: N-gram exact matching
        for sentence in sentences:
            exact_matches = self._extract_exact_from_sentence(sentence)
            if exact_matches:
                all_matches.extend(exact_matches)
            else:
                sentences_without_exact.append(sentence)

        # Pass 2: Semantic matching for sentences without exact matches
        if sentences_without_exact:
            semantic_matches = self._extract_semantic_from_sentences(sentences_without_exact)
            all_matches.extend(semantic_matches)

        return self._deduplicate(all_matches)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _split_sentences(text: str) -> list[str]:
        """Split text into sentences."""
        # Split on period, semicolon, newline, or bullet points
        parts = re.split(r"[.\n;•|]+", text)
        sentences = [p.strip() for p in parts if len(p.strip()) >= 5]
        return sentences if sentences else [text]

    def _extract_ngrams(self, text: str, max_n: int = 4) -> list[str]:
        """Extract word n-grams (1 through max_n) from text."""
        words = text.lower().split()
        ngrams = []
        for n in range(max_n, 0, -1):  # longest first
            for i in range(len(words) - n + 1):
                ngram = " ".join(words[i : i + n])
                ngrams.append(ngram)
        return ngrams

    def _extract_exact_from_sentence(self, sentence: str) -> list[SkillMatch]:
        """Try to find exact taxonomy matches from n-grams in a sentence."""
        ngrams = self._extract_ngrams(sentence, max_n=4)
        matches: list[SkillMatch] = []
        found_skills: set[str] = set()

        for ngram in ngrams:
            normalized = normalize_skill(ngram)
            if (
                normalized
                and normalized in self._skill_lookup
                and normalized not in found_skills
                and normalized not in NOISE_SKILLS
            ):
                info = self._skill_lookup[normalized]
                matches.append(SkillMatch(
                    skill_name=normalized,
                    skill_id=info["skill_id"],
                    category=info["category"],
                    confidence=1.0,
                    matched_from=ngram,
                ))
                found_skills.add(normalized)

        return matches

    def _extract_semantic_from_sentences(
        self,
        sentences: list[str],
        n_results: int = 3,
    ) -> list[SkillMatch]:
        """Encode sentences and query ChromaDB for semantically similar skills."""
        if not sentences:
            return []

        embeddings = self.model.encode(sentences).tolist()
        results = query_skills(self.collection, embeddings, n_results=n_results)

        matches: list[SkillMatch] = []
        for sentence, result_list in zip(sentences, results):
            for match in result_list:
                if (
                    match["similarity"] >= self.threshold
                    and match["skill_name"] not in NOISE_SKILLS
                ):
                    matches.append(SkillMatch(
                        skill_name=match["skill_name"],
                        skill_id=match["skill_id"],
                        category=match["category"],
                        confidence=match["similarity"],
                        matched_from=sentence,
                    ))

        return matches

    @staticmethod
    def _deduplicate(matches: list[SkillMatch]) -> list[SkillMatch]:
        """Deduplicate matches, keeping the highest confidence per skill."""
        best: dict[str, SkillMatch] = {}
        for m in matches:
            if m.skill_name not in best or m.confidence > best[m.skill_name].confidence:
                best[m.skill_name] = m
        # Sort by confidence descending
        return sorted(best.values(), key=lambda x: x.confidence, reverse=True)
