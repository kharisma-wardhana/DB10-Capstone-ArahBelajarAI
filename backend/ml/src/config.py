"""Configuration constants for the ML pipeline."""

from pathlib import Path

# ---------- File Paths ----------
BASE_DIR = Path(__file__).resolve().parent.parent  # ml/
DATA_DIR = BASE_DIR / "data" / "process"
SKILL_TAXONOMY_PATH = DATA_DIR / "skill_taxonomy.parquet"
SKILL_TAXONOMY_CATEGORIZED_PATH = DATA_DIR / "skill_taxonomy_categorized.parquet"
SKILL_EMBEDDINGS_PATH = DATA_DIR / "skill_embeddings.parquet"
SKILL_SYNONYMS_PATH = DATA_DIR / "skill_synonyms.json"
JOB_SKILL_MAPPING_PATH = DATA_DIR / "job_skill_mapping.parquet"

# ---------- ChromaDB ----------
CHROMA_HOST = "chromadb"  # matches service name in docker-compose.yaml
CHROMA_PORT = 8001
SKILL_COLLECTION_NAME = "skill_taxonomy"
JOB_TITLE_COLLECTION_NAME = "job_titles"

# ---------- Embedding Model ----------
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

# ---------- Skill Matching Thresholds ----------
SKILL_MATCH_THRESHOLD = 0.45
SKILL_HIGH_CONFIDENCE = 0.70
JOB_TITLE_MATCH_THRESHOLD = 0.50
SKILL_FREQUENCY_MIN_RATIO = 0.05  # min % of jobs that must mention a skill

# ---------- Noise Skills (excluded from results) ----------
NOISE_SKILLS = frozenset({
    "company", "other", "environment", "product", "development",
    "business", "design", "delivery", "operations", "maintenance",
    "planning", "construction", "administrative", "analysis",
    "analytical", "research",
})

# ---------- Skill Category Seeds ----------
CATEGORY_SEEDS = {
    "tech_skills": [
        "python", "javascript", "machine learning", "sql", "docker",
        "react", "tensorflow", "kubernetes", "data engineering", "api design",
        "cloud computing", "cybersecurity", "deep learning", "git", "linux",
        "java", "typescript", "postgresql", "mongodb", "nodejs",
        "pytorch", "scikit-learn", "html", "css", "rest api",
    ],
    "soft_skills": [
        "communication", "teamwork", "problem solving", "time management",
        "critical thinking", "creativity", "negotiation",
        "presentation skills", "emotional intelligence", "conflict resolution",
        "active listening", "empathy", "interpersonal skills", "collaboration",
        "attention to detail", "organizational skills",
    ],
    "leadership": [
        "project management", "team leadership", "strategic planning",
        "decision making", "mentoring", "stakeholder management",
        "change management", "people management", "agile", "scrum",
        "product management", "program management", "coaching",
        "performance management", "talent management",
    ],
    "domain_knowledge": [
        "finance", "marketing", "healthcare", "supply chain", "accounting",
        "human resources", "legal", "manufacturing", "retail", "real estate",
        "insurance", "banking", "logistics", "consulting", "sales",
        "customer service", "engineering", "information technology",
    ],
    "adaptation_skills": [
        "continuous learning", "self-directed learning", "resilience",
        "growth mindset", "digital literacy", "cross-functional collaboration",
        "remote work", "innovation", "entrepreneurship", "cultural awareness",
        "adaptability", "flexibility", "curiosity", "self-motivation",
    ],
}
