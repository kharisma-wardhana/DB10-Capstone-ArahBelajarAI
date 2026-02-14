"""Model 2: Skill Gap Analyzer — compare user skills vs job requirements.

Pipeline:
1. Semantic search for target job title in ChromaDB
2. Aggregate required skills from job_skill_mapping
3. Match user skills against required skills using cosine similarity
4. Compute category breakdown and readiness score
"""

import json
from dataclasses import asdict, dataclass, field

import chromadb
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

from ml.src.chromadb_manager import (
    _aggregate_job_skills,
    _normalize_job_title,
    query_job_titles,
)
from ml.src.config import (
    EMBEDDING_MODEL_NAME,
    JOB_SKILL_MAPPING_PATH,
    JOB_TITLE_COLLECTION_NAME,
    JOB_TITLE_MATCH_THRESHOLD,
    NOISE_SKILLS,
    SKILL_EMBEDDINGS_PATH,
    SKILL_MATCH_THRESHOLD,
    SKILL_TAXONOMY_CATEGORIZED_PATH,
)
from ml.src.skill_extractor import SkillMatch


@dataclass
class RequiredSkill:
    """A skill required for a target job."""

    skill_name: str
    category: str
    frequency: float  # fraction of jobs mentioning this skill
    importance_rank: int

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class MatchedSkillDetail:
    """A user skill that matches a required skill."""

    user_skill: str
    required_skill: str
    category: str
    similarity: float
    frequency: float  # how common this required skill is

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class CategoryScore:
    """Coverage score for a single skill category."""

    category: str
    total_required: int
    user_has: int
    coverage_pct: float
    missing: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class GapAnalysisResult:
    """Complete gap analysis result."""

    job_title_matched: str
    job_title_confidence: float
    matched_skills: list[MatchedSkillDetail]
    missing_skills: list[RequiredSkill]
    category_breakdown: dict[str, CategoryScore]
    overall_readiness_score: float

    def to_dict(self) -> dict:
        return {
            "job_title_matched": self.job_title_matched,
            "job_title_confidence": self.job_title_confidence,
            "matched_skills": [m.to_dict() for m in self.matched_skills],
            "missing_skills": [m.to_dict() for m in self.missing_skills],
            "category_breakdown": {k: v.to_dict() for k, v in self.category_breakdown.items()},
            "overall_readiness_score": self.overall_readiness_score,
        }


class SkillGapAnalyzer:
    """Analyze the gap between user skills and job requirements.

    Args:
        chroma_client: ChromaDB client instance.
        model: SentenceTransformer model.
        job_skill_path: Path to job_skill_mapping parquet.
        taxonomy_path: Path to categorized taxonomy parquet.
        embeddings_path: Path to skill embeddings parquet.
        collection_name: ChromaDB collection name for job titles.
    """

    def __init__(
        self,
        chroma_client: chromadb.ClientAPI,
        model: SentenceTransformer | None = None,
        job_skill_path: str | None = None,
        taxonomy_path: str | None = None,
        embeddings_path: str | None = None,
        collection_name: str = JOB_TITLE_COLLECTION_NAME,
    ):
        self.client = chroma_client
        self.model = model or SentenceTransformer(EMBEDDING_MODEL_NAME)
        self.collection = chroma_client.get_collection(collection_name)

        # Load job-skill aggregation
        js_path = job_skill_path or str(JOB_SKILL_MAPPING_PATH)
        job_skill_df = pd.read_parquet(js_path)
        self._title_skills = _aggregate_job_skills(job_skill_df)

        # Load categorized taxonomy for category lookup
        tax_path = taxonomy_path or str(SKILL_TAXONOMY_CATEGORIZED_PATH)
        tax_df = pd.read_parquet(tax_path)
        self._skill_category: dict[str, str] = {
            row["skill_name"]: row.get("category", "tech_skills")
            for _, row in tax_df.iterrows()
        }

        # Load embeddings for similarity computation
        emb_path = embeddings_path or str(SKILL_EMBEDDINGS_PATH)
        emb_df = pd.read_parquet(emb_path)
        if "skill" not in emb_df.columns:
            emb_df.insert(0, "skill", tax_df["skill_name"].values)
        skill_col = "skill"
        emb_cols = [c for c in emb_df.columns if c != skill_col]
        self._skill_vectors: dict[str, np.ndarray] = {
            row[skill_col]: row[emb_cols].values.astype(np.float32)
            for _, row in emb_df.iterrows()
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def analyze(
        self,
        user_skills: list[SkillMatch] | list[str],
        job_title: str,
        match_threshold: float = SKILL_MATCH_THRESHOLD,
    ) -> GapAnalysisResult:
        """Run full gap analysis.

        Args:
            user_skills: List of SkillMatch objects or plain skill name strings.
            job_title: Target job title (will be semantically matched).
            match_threshold: Min cosine similarity for user-to-required matching.

        Returns:
            GapAnalysisResult with matched/missing skills and category breakdown.
        """
        # Normalize user skills to strings
        user_skill_names = [
            s.skill_name if isinstance(s, SkillMatch) else s
            for s in user_skills
        ]

        # Step 1: Find matching job title
        matched_title, title_confidence, required_skills = self._find_job_requirements(job_title)

        if not required_skills:
            return GapAnalysisResult(
                job_title_matched=matched_title or job_title,
                job_title_confidence=title_confidence,
                matched_skills=[],
                missing_skills=[],
                category_breakdown={},
                overall_readiness_score=0.0,
            )

        # Step 2: Match user skills against required skills
        matched, missing = self._compute_gap(
            user_skill_names, required_skills, match_threshold
        )

        # Step 3: Category breakdown
        category_breakdown = self._compute_category_breakdown(matched, missing)

        # Step 4: Overall readiness score
        total_required = len(required_skills)
        total_matched = len(matched)
        readiness = total_matched / total_required if total_required > 0 else 0.0

        return GapAnalysisResult(
            job_title_matched=matched_title,
            job_title_confidence=title_confidence,
            matched_skills=matched,
            missing_skills=missing,
            category_breakdown=category_breakdown,
            overall_readiness_score=round(readiness, 4),
        )

    def get_available_job_titles(self) -> list[str]:
        """Return list of all available normalized job titles."""
        return sorted(self._title_skills.keys())

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _find_job_requirements(
        self, job_title: str
    ) -> tuple[str, float, list[RequiredSkill]]:
        """Find the best matching job title and its required skills.

        Returns (matched_title, confidence, required_skills).
        """
        normalized = _normalize_job_title(job_title)

        # Check exact match first
        if normalized in self._title_skills:
            skills = self._build_required_skills(normalized)
            return normalized, 1.0, skills

        # Semantic search
        query_embedding = self.model.encode(normalized).tolist()
        results = query_job_titles(self.collection, query_embedding, n_results=5)

        if not results or results[0]["similarity"] < JOB_TITLE_MATCH_THRESHOLD:
            return normalized, 0.0, []

        # Use the best matching title
        best = results[0]
        best_title = best["job_title"]

        # Merge skill profiles from top similar titles (weighted by similarity)
        merged_skills = self._merge_skill_profiles(results)

        return best_title, best["similarity"], merged_skills

    def _build_required_skills(self, title: str) -> list[RequiredSkill]:
        """Build RequiredSkill list from aggregated title-skill data."""
        info = self._title_skills.get(title, {})
        skills_data = info.get("skills", [])

        required = []
        for rank, s in enumerate(skills_data, 1):
            skill_name = s["skill"]
            category = self._skill_category.get(skill_name, "tech_skills")
            required.append(RequiredSkill(
                skill_name=skill_name,
                category=category,
                frequency=s["frequency"],
                importance_rank=rank,
            ))

        return required

    def _merge_skill_profiles(
        self,
        title_results: list[dict],
        top_n: int = 3,
    ) -> list[RequiredSkill]:
        """Merge skill profiles from multiple similar job titles.

        Skills are weighted by the job title's similarity score.
        """
        skill_scores: dict[str, float] = {}
        skill_counts: dict[str, int] = {}

        for result in title_results[:top_n]:
            title = result["job_title"]
            sim = result["similarity"]
            info = self._title_skills.get(title, {})
            for s in info.get("skills", []):
                name = s["skill"]
                weighted_freq = s["frequency"] * sim
                skill_scores[name] = skill_scores.get(name, 0) + weighted_freq
                skill_counts[name] = skill_counts.get(name, 0) + 1

        # Normalize by number of contributing titles
        for name in skill_scores:
            skill_scores[name] /= skill_counts[name]

        # Sort by score descending
        sorted_skills = sorted(skill_scores.items(), key=lambda x: -x[1])

        required = []
        for rank, (name, score) in enumerate(sorted_skills[:30], 1):
            category = self._skill_category.get(name, "tech_skills")
            required.append(RequiredSkill(
                skill_name=name,
                category=category,
                frequency=round(score, 4),
                importance_rank=rank,
            ))

        return required

    def _compute_gap(
        self,
        user_skills: list[str],
        required_skills: list[RequiredSkill],
        threshold: float,
    ) -> tuple[list[MatchedSkillDetail], list[RequiredSkill]]:
        """Compare user skills against required skills using cosine similarity.

        Returns (matched_list, missing_list).
        """
        matched: list[MatchedSkillDetail] = []
        missing: list[RequiredSkill] = []
        matched_required: set[str] = set()

        # Get user skill vectors
        user_vectors = {}
        for s in user_skills:
            vec = self._skill_vectors.get(s)
            if vec is not None:
                user_vectors[s] = vec

        for req in required_skills:
            req_vec = self._skill_vectors.get(req.skill_name)
            if req_vec is None:
                missing.append(req)
                continue

            # Check exact match first
            if req.skill_name in user_skills:
                matched.append(MatchedSkillDetail(
                    user_skill=req.skill_name,
                    required_skill=req.skill_name,
                    category=req.category,
                    similarity=1.0,
                    frequency=req.frequency,
                ))
                matched_required.add(req.skill_name)
                continue

            # Semantic matching: find closest user skill
            best_sim = 0.0
            best_user_skill = ""
            for user_s, user_vec in user_vectors.items():
                sim = float(np.dot(user_vec, req_vec) / (
                    np.linalg.norm(user_vec) * np.linalg.norm(req_vec) + 1e-8
                ))
                if sim > best_sim:
                    best_sim = sim
                    best_user_skill = user_s

            if best_sim >= threshold and req.skill_name not in matched_required:
                matched.append(MatchedSkillDetail(
                    user_skill=best_user_skill,
                    required_skill=req.skill_name,
                    category=req.category,
                    similarity=round(best_sim, 4),
                    frequency=req.frequency,
                ))
                matched_required.add(req.skill_name)
            else:
                missing.append(req)

        return matched, missing

    @staticmethod
    def _compute_category_breakdown(
        matched: list[MatchedSkillDetail],
        missing: list[RequiredSkill],
    ) -> dict[str, CategoryScore]:
        """Compute per-category coverage breakdown."""
        categories: dict[str, dict] = {}

        # Count matched per category
        for m in matched:
            cat = m.category
            if cat not in categories:
                categories[cat] = {"matched": 0, "missing": []}
            categories[cat]["matched"] += 1

        # Count missing per category
        for m in missing:
            cat = m.category
            if cat not in categories:
                categories[cat] = {"matched": 0, "missing": []}
            categories[cat]["missing"].append(m.skill_name)

        # Build CategoryScore objects
        result: dict[str, CategoryScore] = {}
        for cat, data in categories.items():
            total = data["matched"] + len(data["missing"])
            coverage = data["matched"] / total if total > 0 else 0.0
            result[cat] = CategoryScore(
                category=cat,
                total_required=total,
                user_has=data["matched"],
                coverage_pct=round(coverage, 4),
                missing=data["missing"],
            )

        return result
