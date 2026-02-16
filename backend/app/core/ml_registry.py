"""Singleton registry for loaded ML models. Initialized once at startup."""

from dataclasses import dataclass, field

import chromadb
from sentence_transformers import SentenceTransformer

from ml.src.chromadb_manager import (
    get_chroma_client,
    populate_job_title_collection,
    populate_skill_collection,
)
from ml.src.skill_extractor import SkillExtractor
from ml.src.skill_gap_analyzer import SkillGapAnalyzer


@dataclass
class MLRegistry:
    """Holds all loaded ML models and clients."""

    chroma_client: chromadb.ClientAPI | None = None
    embedding_model: SentenceTransformer | None = None
    skill_extractor: SkillExtractor | None = None
    skill_gap_analyzer: SkillGapAnalyzer | None = None

    def initialize(self, chroma_host: str, chroma_port: int, model_name: str) -> None:
        """Load all models and initialize ChromaDB collections."""
        print("Initializing MLRegistry...")
        print(f"Connecting to ChromaDB at {chroma_host}:{chroma_port}...")
        self.chroma_client = get_chroma_client(host=chroma_host, port=chroma_port)
        self.embedding_model = SentenceTransformer(model_name)

        populate_skill_collection(self.chroma_client)
        populate_job_title_collection(self.chroma_client, model=self.embedding_model)

        self.skill_extractor = SkillExtractor(
            chroma_client=self.chroma_client,
            model=self.embedding_model,
        )
        self.skill_gap_analyzer = SkillGapAnalyzer(
            chroma_client=self.chroma_client,
            model=self.embedding_model,
        )


ml_registry = MLRegistry()
