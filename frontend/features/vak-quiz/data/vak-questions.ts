import type { LearningStyle } from "@/shared/store/wizard-store";

export interface VakOption {
  text: string;
  style: LearningStyle;
}

export interface VakQuestion {
  id: number;
  question: string;
  options: VakOption[];
}

export const VAK_QUESTIONS: VakQuestion[] = [
  {
    id: 1,
    question: "Saat belajar hal baru, saya lebih suka...",
    options: [
      { text: "Melihat diagram, gambar, atau video tutorial", style: "visual" },
      {
        text: "Mendengarkan penjelasan atau podcast",
        style: "auditory",
      },
      {
        text: "Langsung mencoba dan praktik sendiri",
        style: "kinesthetic",
      },
    ],
  },
  {
    id: 2,
    question: "Saya paling mudah mengingat sesuatu jika...",
    options: [
      { text: "Melihat catatan atau tulisan yang rapi", style: "visual" },
      {
        text: "Mendengar seseorang menjelaskannya",
        style: "auditory",
      },
      {
        text: "Pernah melakukannya secara langsung",
        style: "kinesthetic",
      },
    ],
  },
  {
    id: 3,
    question: "Ketika mengikuti instruksi, saya lebih mudah memahami jika...",
    options: [
      {
        text: "Ada gambar atau ilustrasi langkah-langkahnya",
        style: "visual",
      },
      {
        text: "Seseorang membacakan atau menjelaskannya",
        style: "auditory",
      },
      {
        text: "Saya langsung mencoba sambil membaca instruksi",
        style: "kinesthetic",
      },
    ],
  },
  {
    id: 4,
    question: "Saat presentasi, saya lebih suka menggunakan...",
    options: [
      { text: "Slide dengan banyak grafik dan visual", style: "visual" },
      {
        text: "Penjelasan verbal yang detail dan menarik",
        style: "auditory",
      },
      {
        text: "Demo langsung atau contoh nyata",
        style: "kinesthetic",
      },
    ],
  },
  {
    id: 5,
    question: "Di waktu luang, saya lebih suka...",
    options: [
      {
        text: "Menonton film, membaca buku, atau melihat galeri",
        style: "visual",
      },
      {
        text: "Mendengarkan musik, podcast, atau radio",
        style: "auditory",
      },
      {
        text: "Olahraga, memasak, atau membuat sesuatu",
        style: "kinesthetic",
      },
    ],
  },
  {
    id: 6,
    question:
      "Saat menghadapi masalah, langkah pertama yang saya lakukan adalah...",
    options: [
      {
        text: "Menggambar atau membuat mind map untuk memetakan masalah",
        style: "visual",
      },
      {
        text: "Mendiskusikannya dengan orang lain",
        style: "auditory",
      },
      {
        text: "Langsung mencoba beberapa solusi",
        style: "kinesthetic",
      },
    ],
  },
];

export const VAK_TIPS: Record<
  LearningStyle,
  { label: string; emoji: string; color: string; tips: string[] }
> = {
  visual: {
    label: "Visual",
    emoji: "👁️",
    color: "blue",
    tips: [
      "Gunakan diagram, mind map, dan infografis saat belajar",
      "Pilih kursus dengan banyak visualisasi dan video",
      "Buat catatan berwarna dan highlight poin penting",
      "Gunakan flashcard bergambar untuk menghafal",
    ],
  },
  auditory: {
    label: "Auditori",
    emoji: "👂",
    color: "green",
    tips: [
      "Dengarkan podcast dan audiobook terkait topik belajar",
      "Rekam catatan dan putar ulang saat belajar",
      "Diskusikan materi dengan teman atau mentor",
      "Pilih kursus dengan penjelasan audio yang detail",
    ],
  },
  kinesthetic: {
    label: "Kinestetik",
    emoji: "🤲",
    color: "orange",
    tips: [
      "Langsung praktik coding atau buat project nyata",
      "Pilih kursus hands-on dengan lab dan exercise",
      "Belajar sambil bergerak atau berjalan",
      "Gunakan simulasi dan role-play untuk memahami konsep",
    ],
  },
};
