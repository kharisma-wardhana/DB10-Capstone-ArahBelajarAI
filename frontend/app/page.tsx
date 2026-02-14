"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, MessageSquare } from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "Quiz Gaya Belajar",
    description: "Kenali gaya belajar Visual, Auditori, atau Kinestetik kamu",
  },
  {
    icon: BarChart3,
    title: "Analisis Skill Gap",
    description: "Bandingkan skillmu dengan kebutuhan pekerjaan impian",
  },
  {
    icon: MessageSquare,
    title: "Mock Interview AI",
    description: "Latihan interview dengan AI untuk persiapan karir",
  },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
          ArahBelajar<span className="text-blue-200">AI</span>
        </h1>
        <p className="text-lg sm:text-xl text-white/80 max-w-md mx-auto leading-relaxed">
          Temukan arah belajarmu dengan AI. Identifikasi skill gap dan
          persiapkan karir impianmu.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-10">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 text-center hover:bg-white/15 transition-all"
          >
            <feature.icon className="w-8 h-8 text-blue-200 mx-auto mb-3" />
            <h3 className="text-white font-semibold text-sm mb-1">
              {feature.title}
            </h3>
            <p className="text-white/60 text-xs leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        onClick={() => router.push("/gaya-belajar")}
        size="lg"
        className="bg-white text-indigo-700 hover:bg-white/90 font-semibold text-base px-8 py-6 rounded-full shadow-lg shadow-indigo-900/30 cursor-pointer"
      >
        Mulai Sekarang
      </Button>

      <p className="text-white/40 text-xs mt-6">
        Gratis tanpa perlu login
      </p>
    </div>
  );
}
