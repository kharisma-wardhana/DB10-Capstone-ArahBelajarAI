export interface SkillQuizOption {
  text: string;
  skills: string[];
}

export interface SkillQuizQuestion {
  id: number;
  question: string;
  options: SkillQuizOption[];
  multiSelect: boolean;
}

export const SKILL_QUIZ_QUESTIONS: SkillQuizQuestion[] = [
  {
    id: 1,
    question: "Bahasa pemrograman apa yang kamu kuasai?",
    multiSelect: true,
    options: [
      { text: "Python", skills: ["python"] },
      { text: "JavaScript / TypeScript", skills: ["javascript", "typescript"] },
      { text: "Java", skills: ["java"] },
      { text: "Go / Rust", skills: ["go", "rust"] },
      { text: "Belum ada", skills: [] },
    ],
  },
  {
    id: 2,
    question: "Tools analisis data yang pernah kamu gunakan?",
    multiSelect: true,
    options: [
      { text: "Excel / Google Sheets", skills: ["excel", "google sheets"] },
      { text: "SQL", skills: ["sql"] },
      { text: "Tableau / Power BI", skills: ["tableau", "power bi"] },
      { text: "Pandas / NumPy", skills: ["pandas", "numpy"] },
      { text: "Belum pernah", skills: [] },
    ],
  },
  {
    id: 3,
    question: "Seberapa nyaman kamu bekerja dalam tim?",
    multiSelect: false,
    options: [
      {
        text: "Sangat nyaman, saya sering memimpin diskusi",
        skills: ["teamwork", "leadership", "communication"],
      },
      {
        text: "Cukup nyaman, saya bisa berkolaborasi",
        skills: ["teamwork", "communication"],
      },
      {
        text: "Lebih suka bekerja sendiri",
        skills: ["independent work"],
      },
    ],
  },
  {
    id: 4,
    question: "Pengalaman kamu dengan cloud platform?",
    multiSelect: true,
    options: [
      { text: "AWS", skills: ["aws"] },
      { text: "Google Cloud Platform", skills: ["gcp"] },
      { text: "Microsoft Azure", skills: ["azure"] },
      { text: "Docker / Kubernetes", skills: ["docker", "kubernetes"] },
      { text: "Belum ada", skills: [] },
    ],
  },
  {
    id: 5,
    question: "Framework web yang pernah kamu gunakan?",
    multiSelect: true,
    options: [
      { text: "React / Next.js", skills: ["react", "next.js"] },
      { text: "Vue.js / Nuxt", skills: ["vue.js"] },
      { text: "Django / Flask / FastAPI", skills: ["django", "flask", "fastapi"] },
      { text: "Node.js / Express", skills: ["node.js", "express"] },
      { text: "Belum ada", skills: [] },
    ],
  },
  {
    id: 6,
    question: "Seberapa nyaman kamu presentasi di depan umum?",
    multiSelect: false,
    options: [
      {
        text: "Sangat nyaman, sering presentasi",
        skills: ["public speaking", "presentation", "communication"],
      },
      {
        text: "Cukup nyaman jika sudah dipersiapkan",
        skills: ["presentation", "communication"],
      },
      {
        text: "Kurang nyaman, lebih suka menulis",
        skills: ["writing", "documentation"],
      },
    ],
  },
  {
    id: 7,
    question: "Pengalaman dengan Machine Learning / AI?",
    multiSelect: true,
    options: [
      { text: "TensorFlow / PyTorch", skills: ["tensorflow", "pytorch", "deep learning"] },
      { text: "Scikit-learn", skills: ["scikit-learn", "machine learning"] },
      { text: "NLP / Computer Vision", skills: ["nlp", "computer vision"] },
      { text: "Belum ada", skills: [] },
    ],
  },
  {
    id: 8,
    question: "Skill manajemen project yang kamu miliki?",
    multiSelect: true,
    options: [
      { text: "Agile / Scrum", skills: ["agile", "scrum"] },
      { text: "Jira / Trello", skills: ["project management", "jira"] },
      { text: "Git / GitHub", skills: ["git", "github"] },
      { text: "CI/CD", skills: ["ci/cd", "devops"] },
      { text: "Belum ada", skills: [] },
    ],
  },
];
