# **PROJECT PLAN**

# **Dicoding Bootcamp \- Capstone Project**

**ID Tim Capstone Project :** DB10-I010

**Judul Proyek :** ArahBelajarAI

**Tema yang dipilih :** Accessible & Adaptive Learning

**Learning Path** : Artificial Intelligence

**List Anggota :**

1. B25B10I033 \- Kharisma Nanda Wardhana \- Artificial Intelligence \- **\[Aktif\]**

1. ## **Ringkasan Eksekutif**

Indonesia menghadapi surplus tenaga kerja digital sebesar 600.000 orang per tahun, namun industri tetap kesulitan menemukan talenta yang sesuai karena adanya **mismatch (ketidakcocokan) skill**. Masalah utama yang dihadapi oleh **mahasiswa tingkat akhir** dan **career switcher non-teknis** adalah:

1. Ketidaktahuan tentang standar kompetensi spesifik yang dicari industri saat ini.
2. Kebingungan menentukan prioritas belajar dari banyaknya sumber daya yang tersedia.
3. Sulitnya memetakan hubungan antara skill yang dimiliki saat ini dengan target karir baru.

**ArahBelajarAI** hadir untuk menjembatani gap ini dengan memberikan analisis berbasis data nyata sehingga pengguna tidak lagi "_menebak-nebak_" dalam perjalanan belajar mereka.

### **Research Question**

1. Bagaimana cara mengekstraksi dan membandingkan skill pengguna dengan kebutuhan pasar kerja secara otomatis menggunakan Machine Learning?
2. Bagaimana sistem rekomendasi dapat menghasilkan jalur belajar (_learning path_) yang paling efisien berdasarkan tingkat urgensi skill dan ketersediaan kursus?

**ArahBelajarAI** adalah aplikasi PWA (Progressive Web Apps) yang dirancang untuk mempercepat kesiapan kerja talenta digital Indonesia. Menggunakan teknologi _Machine Learning_ khususnya NLP (_Natural Language Processing_), platform ini menganalisis profil pengguna terhadap ribuan data lowongan kerja aktif untuk mengidentifikasi _skill gap_. Hasil akhirnya adalah skor kesiapan kerja dan peta jalan belajar (_roadmap_) yang dikurasi secara otomatis. Fokus MVP adalah memberikan nilai instan pada fitur analisis dan rekomendasi, sementara fitur pendukung seperti pendamping belajar (_AI Companion_) akan dikembangkan pada fase berikutnya.

2. ## **Cakupan Proyek dan Hasil Kerja**

Proyek ini dikembangkan oleh 1 Individu (Software Engineer) dengan dukungan penuh dari 3 AI Assistant (Claude, Gemini, dan ChatGPT) untuk efisiensi dan percepatan proses penulisan kode dan proses dokumentasi. Cakupan data dan progress akan berfokus pada pengguna yang ingin pindah karir dari non-tech ke tech industri.

- **Cakupan MVP (Phase 1):**
  - **User Assessment:** User akan menjawab 10 soal untuk mendapatkan informasi terkait device type (mobile atau desktop), learning style (visual, auditori, atau kinesthetic) dan waktu belajar per minggu (dalam satuan jam). Nantinya hasil akan digunakan dalam proses sistem rekomendasi kursus/materi belajar agar lebih personal.
  - **Skill Extractor:** User akan diminta input skill secara manual atau paste deskripsi dari Resume/CV untuk mendapatkan list skill yang sudah dimiliki.
  - **Skill Gap Visualizer:** User akan memilih dream job yang diinginkan kemudian system akan melakukan analisis perbandingan skill user vs requirement skill. Menampilkan skill yang sudah dimiliki vs skill yang masih kurang dalam bentuk chart / graph dengan 5 kategori utama soft skill, tech skill, leadership, domain knowledge, dan adaptation skill)
  - **Learning Path Generator:** System akan memanfaatkan dataset kursus (udemy dan coursera) dan melakukan rekomendasi menggunakan content based rekomendasi berdasarkan profil user. Daftar kursus/materi belajar yang disusun secara berurutan berdasarkan skill priority pada job requirement.
- **Hasil Kerja:**
  - Dokumentasi teknis dan source code pada github
  - PWA ArahBelajar AI (frontend NextJS 15 dan backend FastAPI)
  - Embedding data dalam chromaDB
- **Eksklusi (Phase 2):** Fitur Pomodoro Timer dan _AI Companion_ untuk menemani progres belajar.

3. ## **Jadwal Pengerjaan**

| Minggu                      | Fokus Kegiatan                | Detail Aktivitas & Milestone                                                                                                                                                                                                                                                      |
| :-------------------------- | :---------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Minggu 1** (9-15 Feb)     | **Planning & Data**           | • Finalisasi dataset kursus. • Setup repo GitHub & environment dev. • Desain arsitektur database & API.                                                                                                                                                                           |
| **Minggu 2** (16-22 Feb)    | **AI & Backend Dev**          | • Implementasi **all-MiniLM-L6-v2** & _ChromaDB_. • Pembuatan API Endpoint (_User Assessment_, _Skill Extractor,_ _Skill Gap Analysis & Generate Learning Path_). • _Milestone: Backend dapat menampilkan hasil skill extraction, skill gap, dan generate learning path._         |
| **Minggu 3** (23 Feb-1 Mar) | **Frontend & Integration**    | • Pembuatan UI dan Component untuk page: _User Assessment, Job Selector, Skill Extractor, dan Dashboard Hasil Analisis_. • Visualisasi hasil learning path (_Timeline_). • Milestone: _Integrasi Frontend ke Backend API berjalan dengan lancar dan error di handle dengan baik_. |
| **Minggu 4** (2-8 Mar)      | **Testing & Refinement**      | • _Mid-Checkpoint Report_ . • Re-check Offline support. • User Testing (_Internal_) memastikan tidak ada error terjadi. • Optimasi kecepatan response (\< 3 detik). • Polish UI/UX agar user flow lebih baik.                                                                     |
| **Minggu 5** (9-15 Mar)     | **Deployment & Finalization** | • Deployment website (Docker). • Penyusunan Project Brief & Video Presentasi.                                                                                                                                                                                                     |

4. ## **Sumber Daya Proyek**

Berikut adalah sumber daya (tools & resources) yang digunakan untuk mendukung pengembangan :

1. **Bahasa Pemrograman:**
   - **Python (3.11+):** Dipilih karena ekosistem library AI/ML yang kuat (backend logic).
   - **TypeScript:** Untuk pengembangan Frontend yang _type-safe_ dan meminimalisir bug.
2. **Framework & Libraries:**
   - **FastAPI:** Framework backend berkinerja tinggi untuk melayani request AI model.
   - **Next.js 15 (App Router):** Framework React untuk frontend yang cepat dan SEO-friendly.
   - **Sentence Transformers (_all-MiniLM-L6-v2)_:** Model NLP ringan namun akurat untuk mengubah teks menjadi vektor (embeddings).
   - **Chroma DB (_Vector DB_):** Library untuk pencarian vektor yang sangat cepat dan efisien.
   - **Supabase (Eksklusif (P2)):** Untuk Auth dan database postgres
   - **LangChain (Eksklusif (P2)):** Library untuk integration dengan Ollama
   - **Ollama (Eksklusif (P2)):** Local LLM untuk handle AI Capabilities (pakai model Llama 3.2-1b)
3. **Infrastructure & Tools:**
   - **Docker:** Untuk kontainerisasi aplikasi agar mudah di-deploy di berbagai environment.
   - **Google Antigravity:** Untuk code editor yang sudah integrate dengan AI Assistant mempercepat proses penulisan kode.
   - **Claude Code:** AI code assistant mempercepat proses penulisan kode.
   - **Gemini:** Untuk membantu proses deep research
   - **ChatGPT:** Untuk membantu proses deep research
   - **Github:** Untuk repository source code
   - **Kaggle:** Untuk mencari dan research dataset
4. **Data:**
   - [Kuisioner VAK Datasets](https://www.kaggle.com/datasets/alyasafina/kuesioner-gaya-belajar-vak/data)
   - Job Datasets:
     1. [LinkedinJob Datasets](https://www.kaggle.com/datasets/arshkon/linkedin-job-postings)
     2. [Indonesia Job Jobstreet Datasets](https://www.kaggle.com/datasets/raflirizkya/indonesian-data-and-analytics-jobs-in-jobstreet)
     3. [JobMarket Insight Datasets](https://www.kaggle.com/datasets/shaistashahid/job-market-insight)
     4. [JobMarket & Skill Demand Datasets](https://www.kaggle.com/datasets/muqaddasejaz/job-market-and-skills-demand-dataset)
   - [Skill Extraction Datasets](https://www.kaggle.com/datasets/muqaddasejaz/resume-cv-skills-extraction-dataset)
   - Course Datasets:
     1. ​​[Coursera Datasets 2025](https://www.kaggle.com/datasets/longnguyen3774/coursera-courses-metadata-for-analytics-2025)
     2. [Udemy Datasets](https://www.kaggle.com/datasets/yusufdelikkaya/udemy-online-education-courses)

5. ## **Rencana Manajemen Risiko dan Isu**

Beberapa risiko potensial dan strategi mitigasinya:

| Risiko / Isu                 | Dampak                                                                                               | Strategi Mitigasi (Solusi)                                                                                                                            |
| :--------------------------- | :--------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kapasitas Solo Developer** | Kewalahan mengerjakan Frontend & Backend.                                                            | Menggunakan AI Assistant (_Claude Code_) untuk otomatisasi pembuatan komponen UI dan boilerplate.                                                     |
| **Kualitas Dataset Rendah**  | Rekomendasi kursus tidak relevan atau _outdated_.                                                    | Melakukan _data cleaning_ ketat di awal dan memprioritaskan dataset kursus dengan rating tinggi (\>4.0) dan update terbaru.                           |
| **Scope Creep**              | Fitur melebar (misal: ingin menambahkan fitur login dan integration LLM) sehingga MVP tidak selesai. | Disiplin pada "_Guest Mode First_". Fitur login dan penyimpanan permanen hanya akan dikerjakan jika core feature sudah 100% stabil (Masuk ke fase 2). |
