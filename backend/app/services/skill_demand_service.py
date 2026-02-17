"""Service for skill demand trend intelligence (SkillPulse)."""

import json
import logging
from pathlib import Path

import pandas as pd

from ml.src.config import DATA_DIR

logger = logging.getLogger(__name__)

SKILL_DEMAND_PREDICTIONS_PATH = DATA_DIR / "skill_demand_predictions.parquet"
SKILL_DEMAND_JSON_PATH = DATA_DIR / "skill_demand_predictions.json"


class SkillDemandService:
    """Loads skill demand predictions and provides trend lookups."""

    def __init__(self) -> None:
        self._predictions: dict[str, dict] = {}

    def load(self) -> None:
        """Load skill demand predictions from parquet or JSON fallback."""
        path = SKILL_DEMAND_PREDICTIONS_PATH
        if path.exists():
            df = pd.read_parquet(path)
            for _, row in df.iterrows():
                name = str(row["skill_name"]).lower().strip()
                self._predictions[name] = {
                    "predicted_trend": row["predicted_trend"],
                    "confidence": float(row["confidence"]),
                    "growth_rate": float(row["growth_rate_pred"]),
                    "current_demand": int(row["current_demand"]),
                    "method": row.get("method", "unknown"),
                }
            logger.info("Loaded %d skill demand predictions.", len(self._predictions))
        elif SKILL_DEMAND_JSON_PATH.exists():
            with open(SKILL_DEMAND_JSON_PATH) as f:
                data = json.load(f)
            for item in data:
                name = str(item["skill_name"]).lower().strip()
                self._predictions[name] = {
                    "predicted_trend": item["predicted_trend"],
                    "confidence": float(item["confidence"]),
                    "growth_rate": float(item["growth_rate_pred"]),
                    "current_demand": int(item["current_demand"]),
                    "method": item.get("method", "unknown"),
                }
            logger.info("Loaded %d skill demand predictions from JSON.", len(self._predictions))
        else:
            logger.warning("No skill demand predictions found at %s", path)

    def get_trend(self, skill_name: str) -> dict | None:
        """Get demand trend for a single skill."""
        return self._predictions.get(skill_name.lower().strip())

    def get_trends_batch(self, skill_names: list[str]) -> dict[str, dict]:
        """Get demand trends for multiple skills."""
        result = {}
        for name in skill_names:
            trend = self.get_trend(name)
            if trend is not None:
                result[name.lower().strip()] = trend
        return result

    def compute_priority_score(
        self,
        frequency: float,
        growth_rate: float,
        freq_weight: float = 0.6,
        growth_weight: float = 0.4,
    ) -> float:
        """Compute priority score combining job frequency and growth rate."""
        # Normalize growth_rate to 0-1 range (typical range is -0.05 to 0.10)
        growth_normalized = max(0.0, min(1.0, (growth_rate + 0.05) / 0.15))
        return freq_weight * frequency + growth_weight * growth_normalized

    @property
    def total_predictions(self) -> int:
        return len(self._predictions)
