"""Service layer wrapping SkillExtractor ML model."""

from ml.src.skill_extractor import SkillExtractor, SkillMatch

from app.schemas.skill_extraction import InputMode


class SkillExtractionService:
    def __init__(self, extractor: SkillExtractor):
        self._extractor = extractor

    def extract_skills(self, text: str, mode: InputMode) -> list[SkillMatch]:
        if mode == InputMode.SKILL_LIST:
            return self._extractor.extract_from_skill_list(text)
        return self._extractor.extract_from_text(text)
