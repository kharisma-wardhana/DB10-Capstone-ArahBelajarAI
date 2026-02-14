"""
ArahBelajarAI ML Module

Provides skill extraction and skill gap analysis using
sentence-transformers (all-MiniLM-L6-v2), ChromaDB, and cosine similarity.
"""

from ml.src.skill_extractor import SkillExtractor
from ml.src.skill_gap_analyzer import SkillGapAnalyzer

__all__ = ["SkillExtractor", "SkillGapAnalyzer"]
