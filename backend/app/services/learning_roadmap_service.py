"""Service for AI-powered personalized learning roadmap generation."""

import hashlib
import logging
from pathlib import Path
from typing import Optional

import chromadb
import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

from ml.src.config import DATA_DIR

logger = logging.getLogger(__name__)

RAW_DIR = Path(__file__).resolve().parent.parent.parent / "ml" / "data" / "raw"
COURSERA_PATH = RAW_DIR / "courses_en.csv"
UDEMY_PATH = RAW_DIR / "udemy_online_education_courses_dataset.csv"
COURSE_COLLECTION_NAME = "course_catalog"


class LearningRoadmapService:
    """Matches missing skills to real courses and generates phased roadmaps."""

    def __init__(
        self,
        chroma_client: chromadb.ClientAPI,
        model: SentenceTransformer,
    ) -> None:
        self._client = chroma_client
        self._model = model
        self._collection: Optional[chromadb.Collection] = None
        self._course_metadata: dict[str, dict] = {}

    def initialize(self) -> None:
        """Load course data, embed, and populate ChromaDB collection."""
        courses = self._load_courses()
        if not courses:
            logger.warning("No courses loaded. Roadmap service will be unavailable.")
            return
        self._populate_collection(courses)
        logger.info("LearningRoadmapService initialized with %d courses.", len(courses))

    def _load_courses(self) -> list[dict]:
        """Load and normalize courses from Coursera and Udemy datasets."""
        courses: list[dict] = []

        # Load Coursera courses
        if COURSERA_PATH.exists():
            try:
                df = pd.read_csv(COURSERA_PATH, on_bad_lines="skip")
                for _, row in df.iterrows():
                    skills_raw = row.get("skills", "")
                    if not isinstance(skills_raw, str) or not skills_raw.strip():
                        continue
                    skills = [s.strip() for s in skills_raw.split(",") if s.strip()]
                    if not skills:
                        continue
                    name = str(row.get("name", "")).strip()
                    if not name:
                        continue
                    courses.append({
                        "id": f"coursera_{hashlib.md5(name.encode()).hexdigest()[:10]}",
                        "title": name,
                        "platform": "Coursera",
                        "url": str(row.get("url", "")),
                        "category": str(row.get("category", "")),
                        "skills": skills,
                        "skill_text": ", ".join(skills[:10]),
                        "level": "All Levels",
                        "subscribers": 0,
                        "reviews": 0,
                        "content_hours": 0,
                    })
                logger.info("Loaded %d Coursera courses.", len(courses))
            except Exception as e:
                logger.error("Failed to load Coursera courses: %s", e)

        # Load Udemy courses
        udemy_start = len(courses)
        if UDEMY_PATH.exists():
            try:
                df = pd.read_csv(UDEMY_PATH, on_bad_lines="skip")
                for _, row in df.iterrows():
                    title = str(row.get("course_title", "")).strip()
                    if not title:
                        continue
                    subject = str(row.get("subject", ""))
                    # Use title + subject as skill proxy for Udemy
                    skill_text = f"{title} {subject}"
                    courses.append({
                        "id": f"udemy_{row.get('course_id', hashlib.md5(title.encode()).hexdigest()[:10])}",
                        "title": title,
                        "platform": "Udemy",
                        "url": str(row.get("url", "")),
                        "category": subject,
                        "skills": [],  # Udemy doesn't have structured skills
                        "skill_text": skill_text,
                        "level": str(row.get("level", "All Levels")),
                        "subscribers": int(row.get("num_subscribers", 0)),
                        "reviews": int(row.get("num_reviews", 0)),
                        "content_hours": float(row.get("content_duration", 0)),
                    })
                logger.info("Loaded %d Udemy courses.", len(courses) - udemy_start)
            except Exception as e:
                logger.error("Failed to load Udemy courses: %s", e)

        return courses

    def _populate_collection(self, courses: list[dict]) -> None:
        """Embed course skill texts and populate ChromaDB."""
        # Deduplicate by ID (duplicate names produce the same hash-based ID)
        seen_ids: set[str] = set()
        unique_courses: list[dict] = []
        for c in courses:
            if c["id"] not in seen_ids:
                seen_ids.add(c["id"])
                unique_courses.append(c)
        courses = unique_courses

        # Delete and recreate for idempotency
        try:
            self._client.delete_collection(COURSE_COLLECTION_NAME)
        except Exception:
            pass
        self._collection = self._client.create_collection(
            name=COURSE_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

        # Embed skill texts
        texts = [c["skill_text"] for c in courses]
        embeddings = self._model.encode(texts, show_progress_bar=True, batch_size=128)

        # Store metadata for later retrieval
        for c in courses:
            self._course_metadata[c["id"]] = c

        # Batch upsert
        batch_size = 500
        ids, docs, embs, metas = [], [], [], []

        for i, course in enumerate(courses):
            ids.append(course["id"])
            docs.append(course["skill_text"])
            embs.append(embeddings[i].tolist())
            metas.append({
                "title": course["title"],
                "platform": course["platform"],
                "url": course["url"],
                "category": course["category"],
                "level": course["level"],
                "subscribers": course["subscribers"],
                "reviews": course["reviews"],
                "content_hours": course["content_hours"],
            })

            if len(ids) >= batch_size:
                self._collection.add(ids=ids, documents=docs, embeddings=embs, metadatas=metas)
                ids, docs, embs, metas = [], [], [], []

        if ids:
            self._collection.add(ids=ids, documents=docs, embeddings=embs, metadatas=metas)

    def find_courses_for_skill(
        self,
        skill_name: str,
        n_results: int = 5,
        vak_style: Optional[str] = None,
    ) -> list[dict]:
        """Find top courses matching a given skill."""
        if self._collection is None:
            return []

        embedding = self._model.encode([skill_name])[0].tolist()
        results = self._collection.query(
            query_embeddings=[embedding],
            n_results=min(n_results * 2, 20),  # fetch extra for re-ranking
            include=["metadatas", "distances"],
        )

        courses = []
        for j in range(len(results["ids"][0])):
            meta = results["metadatas"][0][j]
            dist = results["distances"][0][j]
            similarity = 1.0 - dist

            if similarity < 0.25:
                continue

            course = {
                "title": meta["title"],
                "platform": meta["platform"],
                "url": meta["url"],
                "category": meta["category"],
                "level": meta["level"],
                "match_score": round(similarity, 3),
                "subscribers": meta.get("subscribers", 0),
                "reviews": meta.get("reviews", 0),
                "content_hours": meta.get("content_hours", 0),
            }

            # VAK-aware boosting
            if vak_style:
                course["match_score"] = self._apply_vak_boost(
                    course, vak_style, similarity
                )

            courses.append(course)

        # Sort by boosted match score and return top N
        courses.sort(key=lambda c: c["match_score"], reverse=True)
        return courses[:n_results]

    def _apply_vak_boost(
        self, course: dict, vak_style: str, base_score: float
    ) -> float:
        """Apply VAK learning style boost to course relevance score."""
        boost = 0.0
        content_hours = course.get("content_hours", 0)

        if vak_style == "visual":
            # Prefer Udemy (video-heavy) and longer video content
            if course["platform"] == "Udemy":
                boost += 0.03
            if content_hours > 5:
                boost += 0.02
        elif vak_style == "auditory":
            # Prefer Coursera (lecture-format, structured)
            if course["platform"] == "Coursera":
                boost += 0.03
        elif vak_style == "kinesthetic":
            # Prefer project-based, hands-on (longer courses, higher engagement)
            if content_hours > 10:
                boost += 0.03
            subscribers = course.get("subscribers", 0)
            if subscribers > 10000:
                boost += 0.02

        # Social proof boost (normalized)
        subscribers = course.get("subscribers", 0)
        if subscribers > 50000:
            boost += 0.02
        elif subscribers > 10000:
            boost += 0.01

        return round(base_score + boost, 3)

    def generate_roadmap(
        self,
        missing_skills: list[dict],
        vak_style: Optional[str] = None,
        courses_per_skill: int = 3,
    ) -> dict:
        """Generate a phased learning roadmap from missing skills.

        Args:
            missing_skills: List of dicts with skill_name, category, frequency, priority_score.
            vak_style: User's VAK learning style (visual, auditory, kinesthetic).
            courses_per_skill: Number of course recommendations per skill.

        Returns:
            Roadmap dict with phases, each containing skills and course recommendations.
        """
        if not missing_skills:
            return {"phases": [], "total_skills": 0, "total_courses": 0}

        # Sort by priority_score (already sorted from gap analysis, but ensure)
        sorted_skills = sorted(
            missing_skills,
            key=lambda s: s.get("priority_score", s.get("frequency", 0)),
            reverse=True,
        )

        # Divide into 3 phases
        total = len(sorted_skills)
        phase_size = max(1, total // 3)

        phases = []
        phase_configs = [
            {"name": "Fondasi", "description": "Skill dasar dan prioritas tinggi", "weeks": "Minggu 1-4"},
            {"name": "Pengembangan", "description": "Skill teknis inti", "weeks": "Minggu 5-8"},
            {"name": "Pendalaman", "description": "Skill lanjutan dan spesialisasi", "weeks": "Minggu 9-12"},
        ]

        total_courses = 0
        for phase_idx, config in enumerate(phase_configs):
            start = phase_idx * phase_size
            if phase_idx == 2:
                # Last phase gets all remaining
                end = total
            else:
                end = min(start + phase_size, total)

            phase_skills = sorted_skills[start:end]
            if not phase_skills:
                continue

            skill_items = []
            for skill_data in phase_skills:
                skill_name = skill_data.get("skill_name", "")
                courses = self.find_courses_for_skill(
                    skill_name,
                    n_results=courses_per_skill,
                    vak_style=vak_style,
                )
                total_courses += len(courses)
                skill_items.append({
                    "skill_name": skill_name,
                    "category": skill_data.get("category", ""),
                    "frequency": skill_data.get("frequency", 0),
                    "priority_score": skill_data.get("priority_score", 0),
                    "courses": courses,
                })

            phases.append({
                "phase": phase_idx + 1,
                "name": config["name"],
                "description": config["description"],
                "weeks": config["weeks"],
                "skills": skill_items,
            })

        return {
            "phases": phases,
            "total_skills": total,
            "total_courses": total_courses,
            "vak_style": vak_style,
        }

    @property
    def is_ready(self) -> bool:
        return self._collection is not None
