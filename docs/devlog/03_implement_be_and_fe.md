---
Writer: Kharisma Wardhana
Date: 2026-02-17
Title: "🛠️ Devlog: ArahBelajarAI - Implement Backend and Frontend"
---

## 🛠️ Devlog: ArahBelajarAI - Implement Backend and Frontend

Document ini mencatat step by step proses implementasi backend FastAPI dan frontend NextJS untuk proyek ArahBelajarAI.

### Tasks yang dilakukan

- Implementasi Backend FastAPI (2026-02-14)
- [x] Setup konfigurasi aplikasi dengan Pydantic Settings (`app/config.py`)
- [x] Membuat ML Registry untuk mengelola model ML (`app/core/ml_registry.py`)
- [x] Membuat dependency injection providers (`app/dependencies.py`)
- [x] Membuat custom exception handlers (`app/exceptions.py`)
- [x] Setup FastAPI app dengan lifespan management (`app/main.py`)
- [x] Implementasi API Routers:
  - [x] `routers/health.py` - Health check endpoints (/health, /ready)
  - [x] `routers/skill_extraction.py` - Skill extraction endpoint
  - [x] `routers/skill_gap.py` - Skill gap analysis endpoint
  - [x] `routers/interview.py` - Mock interview endpoints
- [x] Membuat Pydantic schemas untuk request/response:
  - [x] `schemas/common.py` - Generic response wrapper
  - [x] `schemas/skill_extraction.py` - Skill extraction models
  - [x] `schemas/skill_gap.py` - Skill gap models
  - [x] `schemas/interview.py` - Interview models
- [x] Implementasi Service layer:
  - [x] `services/skill_extraction_service.py` - Skill extraction logic
  - [x] `services/skill_gap_service.py` - Skill gap analysis logic
  - [x] `services/interview_service.py` - Mock interview with LangChain/OpenAI
- [x] Membuat notebook tambahan untuk ML pipeline:
  - [x] `05_skill_extractor.ipynb` - Skill extractor model
  - [x] `06_skill_gap_analyzer.ipynb` - Skill gap analyzer model
- [x] Update file `.env.example` dengan konfigurasi yang diperlukan

- Konfigurasi PWA dan UI Components (2026-02-14)
- [x] Setup PWA manifest (`app/manifest.ts`)
- [x] Update layout dengan PWA support (`app/layout.tsx`)
- [x] Konfigurasi next.config.ts untuk PWA
- [x] Setup shadcn/ui components:
  - [x] `components/ui/badge.tsx`
  - [x] `components/ui/button.tsx`
  - [x] `components/ui/card.tsx`
  - [x] `components/ui/command.tsx`
  - [x] `components/ui/dialog.tsx`
  - [x] `components/ui/input.tsx`
  - [x] `components/ui/progress.tsx`
  - [x] `components/ui/radio-group.tsx`
  - [x] `components/ui/select.tsx`
  - [x] `components/ui/skeleton.tsx`
  - [x] `components/ui/tabs.tsx`
- [x] Setup API client dan endpoints (`shared/api/`)
- [x] Membuat wizard shell layout (`shared/components/layout/wizard-shell.tsx`)
- [x] Setup Zustand store untuk wizard state (`shared/store/wizard-store.ts`)

- Implementasi Frontend Feature Pages (2026-02-14)
- [x] Membuat halaman wizard flow:
  - [x] `app/(wizard)/gaya-belajar/page.tsx` - VAK quiz page
  - [x] `app/(wizard)/pekerjaan-impian/page.tsx` - Job selection page
  - [x] `app/(wizard)/input-skill/page.tsx` - Skill input page
  - [x] `app/(wizard)/hasil-analisis/page.tsx` - Analysis results dashboard
- [x] Membuat halaman interview:
  - [x] `app/interview/page.tsx` - Mock interview chat page
  - [x] `app/interview/feedback/page.tsx` - Interview feedback page
- [x] Implementasi VAK Quiz feature:
  - [x] `features/vak-quiz/components/vak-question-card.tsx`
  - [x] `features/vak-quiz/components/vak-result-card.tsx`
  - [x] `features/vak-quiz/data/vak-questions.ts`
  - [x] `features/vak-quiz/lib/vak-scoring.ts`
- [x] Implementasi Skill Input feature:
  - [x] `features/skill-input/components/skill-quiz.tsx`
  - [x] `features/skill-input/components/skill-tag-input.tsx`
  - [x] `features/skill-input/data/skill-quiz-questions.ts`
  - [x] `features/skill-input/lib/skill-quiz-scoring.ts`
- [x] Implementasi Job Selection feature:
  - [x] `features/job-selection/components/job-combobox.tsx`
  - [x] `features/job-selection/components/top-jobs-grid.tsx`
  - [x] `features/job-selection/data/top-jobs-id-2025.ts`
- [x] Implementasi Skill Gap Visualizer:
  - [x] `features/skill-gap/components/radar-chart.tsx`
  - [x] `features/skill-gap/components/readiness-gauge.tsx`
  - [x] `features/skill-gap/components/skill-category-card.tsx`
- [x] Implementasi Interview feature:
  - [x] `features/interview/components/chat-input.tsx`
  - [x] `features/interview/components/chat-message.tsx`
  - [x] `features/interview/components/feedback-summary.tsx`
  - [x] `features/interview/lib/sse-client.ts`

- Update Color Themes dan UI Style (2026-02-14)
- [x] Update color themes di `globals.css`
- [x] Improve styling pada UI components

- Implementasi Recommendation Engine dan Skill Demand (2026-02-17)
- [x] Membuat roadmap router (`routers/roadmap.py`)
- [x] Membuat roadmap schemas (`schemas/roadmap.py`)
- [x] Implementasi Learning Roadmap Service (`services/learning_roadmap_service.py`)
- [x] Implementasi Skill Demand Service (`services/skill_demand_service.py`)
- [x] Update ML Registry untuk load roadmap dan skill demand services
- [x] Update skill gap endpoint dengan trend data
- [x] Implementasi Roadmap feature di frontend:
  - [x] `features/roadmap/components/course-card.tsx`
  - [x] `features/roadmap/components/roadmap-timeline.tsx`
- [x] Implementasi Skill Priority Chart (`features/skill-gap/components/skill-priority-chart.tsx`)
- [x] Implementasi Trend Badge (`features/skill-gap/components/trend-badge.tsx`)
- [x] Update API endpoints dan types untuk roadmap
- [x] Update wizard store untuk menyimpan roadmap data

- Bug Fixes dan Improvements (2026-02-14 - 2026-02-17)
- [x] Fix module error pada notebook
- [x] Fix requirements.txt untuk install dependencies
- [x] Fix padding layout
- [x] Update ChromaDB host configuration
- [x] Add pyarrow package untuk parquet support
- [x] Handle CORS error pada NextJS
- [x] Implement manifest.json dan logos untuk PWA preparation
