"""Service layer wrapping SkillGapAnalyzer ML model."""

from ml.src.skill_gap_analyzer import GapAnalysisResult, SkillGapAnalyzer

from app.exceptions import JobTitleNotFoundError


class SkillGapService:
    def __init__(self, analyzer: SkillGapAnalyzer):
        self._analyzer = analyzer

    def analyze_gap(self, user_skill_names: list[str], job_title: str) -> GapAnalysisResult:
        result = self._analyzer.analyze(user_skills=user_skill_names, job_title=job_title)
        if result.job_title_confidence == 0.0 and not result.matched_skills:
            raise JobTitleNotFoundError(job_title)
        return result

    def get_available_titles(self) -> list[str]:
        return self._analyzer.get_available_job_titles()
