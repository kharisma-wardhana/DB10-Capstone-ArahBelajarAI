# ArahBelajarAI

## Overview

ArahBelajarAI is a Progressive Web App (PWA) designed to accelerate the job readiness of Indonesia's digital talent. The platform leverages Machine Learning (NLP) to analyze user profiles against thousands of active job postings, identifying skill gaps and generating a personalized learning roadmap. The MVP focuses on instant value through skill analysis and recommendations, targeting career switchers and final-year students aiming for tech roles.

## Key Problems Addressed

- Lack of clarity on industry-required skills
- Difficulty prioritizing learning resources
- Challenges mapping current skills to new career targets

## Core Features (MVP)

- **User Assessment:** Short quiz to capture device type, learning style, and weekly study time for personalized recommendations.
- **Skill Extractor:** Extracts user skills from manual input or resume/CV text.
- **Skill Gap Visualizer:** Compares user skills to dream job requirements, visualizing gaps across five categories (soft skills, tech skills, leadership, domain knowledge, adaptation skills).
- **Learning Path Generator:** Recommends and sequences courses (from Udemy, Coursera) based on user profile and job requirements using content-based filtering.

## Tech Stack

- **Backend:** Python 3.11+, FastAPI, Sentence Transformers (all-MiniLM-L6-v2), ChromaDB
- **Frontend:** Next.js 15 (TypeScript, App Router)
- **Infrastructure:** Docker

## Datasets

- [Kuisioner VAK Datasets](https://www.kaggle.com/datasets/alyasafina/kuesioner-gaya-belajar-vak/data)
- Job Datasets:
  - [LinkedinJob Datasets](https://www.kaggle.com/datasets/arshkon/linkedin-job-postings)
  - [Indonesia Jobstreet Datasets](https://www.kaggle.com/datasets/raflirizkya/indonesian-data-and-analytics-jobs-in-jobstreet)
  - [JobMarket Insight Datasets](https://www.kaggle.com/datasets/shaistashahid/job-market-insight)
  - [FreelanceIncomeSkill Datasets](https://www.kaggle.com/datasets/shaistashahid/freelancer-income-vs-skills)
- [Skill Extraction Datasets](https://www.kaggle.com/datasets/muqaddasejaz/resume-cv-skills-extraction-dataset)
- Course Datasets:
  - [Coursera Datasets 2025](https://www.kaggle.com/datasets/longnguyen3774/coursera-courses-metadata-for-analytics-2025)
  - [Udemy Datasets](https://www.kaggle.com/datasets/yusufdelikkaya/udemy-online-education-courses)

## Project Structure

- `backend/` – FastAPI backend, ML models, API
- `frontend/` – Next.js frontend (TypeScript)
- `ml/` – Data, notebooks, and ML scripts
- `docs/` – Project documentation

## Roadmap & Milestones

1. **Planning & Data:** Finalize datasets, set up repo, design DB & API
2. **AI & Backend Dev:** Implement ML models, ChromaDB, and core API endpoints
3. **Frontend & Integration:** Build UI for assessment, job selector, skill extractor, dashboard, and integrate with backend
4. **Testing & Refinement:** Internal user testing, optimize response time, polish UI/UX
5. **Deployment & Finalization:** Docker deployment, project brief, and presentation

---
For detailed planning and documentation, see [docs/DB10-ProjectPlan-ArahBelajarAI.md](docs/DB10-ProjectPlan-ArahBelajarAI.md).
