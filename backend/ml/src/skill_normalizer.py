"""Skill text normalization — ported from notebook 02_skill_extraction."""

import json
import re
from pathlib import Path
from typing import Optional

from ml.src.config import SKILL_SYNONYMS_PATH


def load_synonyms(path: Optional[Path] = None) -> dict[str, str]:
    """Load skill synonym mapping from JSON file."""
    path = path or SKILL_SYNONYMS_PATH
    with open(path) as f:
        return json.load(f)


# Module-level cache
_SYNONYMS: dict[str, str] | None = None


def _get_synonyms() -> dict[str, str]:
    global _SYNONYMS
    if _SYNONYMS is None:
        _SYNONYMS = load_synonyms()
    return _SYNONYMS


def normalize_skill(skill_str: str, synonyms: Optional[dict[str, str]] = None) -> str:
    """Normalize a single skill string.

    1. Lowercase + strip whitespace/punctuation
    2. Apply synonym mapping
    """
    if not isinstance(skill_str, str):
        return ""
    s = skill_str.strip().lower()
    s = re.sub(r"^[\s\-\.\,]+|[\s\-\.\,]+$", "", s)
    if not s:
        return ""
    syns = synonyms if synonyms is not None else _get_synonyms()
    return syns.get(s, s)


def parse_skills_csv(text: str, sep: str = ",", synonyms: Optional[dict[str, str]] = None) -> list[str]:
    """Parse a comma-separated skills string into a deduplicated list of normalized skills."""
    if not isinstance(text, str) or not text.strip():
        return []
    seen: set[str] = set()
    result: list[str] = []
    for raw in text.split(sep):
        s = normalize_skill(raw, synonyms)
        if s and s not in seen:
            seen.add(s)
            result.append(s)
    return result


def preprocess_text(text: str) -> str:
    """Clean free-form text for skill extraction."""
    if not isinstance(text, str):
        return ""
    text = text.strip()
    # Collapse multiple whitespace/newlines
    text = re.sub(r"\s+", " ", text)
    return text
