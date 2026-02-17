---
Writer: Kharisma Wardhana
Date: 2026-02-14
Title: "🛠️ Devlog: ArahBelajarAI - Process Dataset & Modelling"
---

## 🛠️ Devlog: ArahBelajarAI - Process Dataset & Modelling

Document ini mencatat step by step proses pengolahan dataset dan pembuatan model machine learning untuk proyek ArahBelajarAI.

### Tasks yang dilakukan

- Data Cleaning & Preprocessing
- [x] Membuat notebook `01_data_cleaning.ipynb` untuk membersihkan dan memproses raw dataset
- [x] Menggabungkan dataset dari berbagai sumber (LinkedIn, JobStreet, JobMarket Insight)
- [x] Menghapus duplikasi dan missing values pada dataset

- Skill Extraction Analysis
- [x] Membuat notebook `02_skill_extraction.ipynb` untuk analisis ekstraksi skill
- [x] Mengimplementasikan teknik NLP untuk mengekstrak skill dari job descriptions
- [x] Menyiapkan mapping skill categories (soft skill, tech skill, leadership, domain knowledge, adaptation skill)

- Exploratory Data Analysis (EDA) Skill Demand
- [x] Membuat notebook `03_eda_skill_demand.ipynb` untuk analisis tren skill di pasar kerja
- [x] Generate visualisasi untuk analisis:
  - [x] `01_dataset_overview.png` - Overview statistik dataset
  - [x] `02_top30_skills_overall.png` - Top 30 skill yang paling dicari
  - [x] `03_top_skills_by_industry.png` - Top skill berdasarkan industri
  - [x] `04_skill_industry_heatmap.png` - Heatmap skill vs industri
  - [x] `05_skill_frequency_distribution.png` - Distribusi frekuensi skill
  - [x] `06_skills_per_job.png` - Rata-rata skill per job posting
  - [x] `07_monthly_skill_trends.png` - Tren skill bulanan
  - [x] `08_skill_growth_rates.png` - Growth rate skill
  - [x] `09_emerging_skills_scatter.png` - Scatter plot emerging skills
  - [x] `10_skill_cooccurrence_heatmap.png` - Heatmap co-occurrence skill
  - [x] `11_skill_network_graph.png` - Network graph relasi skill
  - [x] `13_top_skills_by_location.png` - Top skill berdasarkan lokasi
  - [x] `14_location_skill_heatmap.png` - Heatmap skill vs lokasi
  - [x] `15_salary_by_skill.png` - Analisis salary berdasarkan skill
  - [x] `16_salary_by_industry.png` - Analisis salary berdasarkan industri
  - [x] `17_salary_premium_by_skill.png` - Skill premium salary
  - [x] `18_industry_postings_over_time.png` - Tren posting industri
  - [x] `19_industry_distinctive_skills.png` - Skill unik per industri
  - [x] `20_skill_wordcloud.png` - Word cloud skill

- Skill Demand Prediction Model
- [x] Membuat notebook `04_skill_demand_model.ipynb` untuk model prediksi demand skill
- [x] Training model untuk klasifikasi skill trend (hot, stable, declining)
- [x] Generate visualisasi model evaluation:
  - [x] `21_label_distribution.png` - Distribusi label training
  - [x] `22_model_comparison.png` - Perbandingan performa model
  - [x] `23_confusion_matrix.png` - Confusion matrix model terbaik
  - [x] `25_predicted_vs_actual_growth.png` - Predicted vs actual growth
  - [x] `26_hot_vs_declining_skills.png` - Visualisasi hot vs declining skills

- Docker Configuration
- [x] Update `docker-compose.yaml` untuk setup ChromaDB service
