"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, MessageSquare, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useWizardStore } from "@/shared/store/wizard-store";
import { ThemeToggle } from "@/shared/components/theme-toggle";

const FEATURES = [
  {
    icon: Brain,
    title: "Quiz Gaya Belajar",
    description: "Kenali gaya belajar Visual, Auditori, atau Kinestetik kamu",
    step: 1,
  },
  {
    icon: BarChart3,
    title: "Analisis Skill Gap",
    description: "Bandingkan skillmu dengan kebutuhan pekerjaan impian",
    step: 2,
  },
  {
    icon: MessageSquare,
    title: "Mock Interview AI",
    description: "Latihan interview dengan AI untuk persiapan karir",
    step: 3,
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function Home() {
  const router = useRouter();
  const { hasProgress, completedSteps, currentStep } = useWizardStore();
  const showResume = hasProgress();

  const STEP_PATHS = [
    "/gaya-belajar",
    "/pekerjaan-impian",
    "/input-skill",
    "/hasil-analisis",
  ];
  const resumePath =
    STEP_PATHS[Math.min(currentStep - 1, STEP_PATHS.length - 1)];

  return (
    <div className="min-h-screen bg-linear-to-br from-brand-gradient-start to-brand-gradient-end flex flex-col items-center justify-center px-4 pb-safe">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4 pt-safe">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-text mb-4 tracking-tight">
          ArahBelajar<span className="text-brand-primary-light">AI</span>
        </h1>
        <p className="text-lg sm:text-xl text-brand-text-muted max-w-md mx-auto leading-relaxed">
          Temukan arah belajarmu dengan AI. Identifikasi skill gap dan
          persiapkan karir impianmu.
        </p>
      </motion.div>

      {/* Resume Banner */}
      {showResume && (
        <Button
          onClick={() => router.push(resumePath)}
          className="w-full max-w-md mb-6 backdrop-blur-xl bg-brand-card border border-brand-secondary/30 rounded-2xl p-8 flex items-center gap-3 cursor-pointer hover:bg-brand-card-hover transition-all"
        >
          <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center">
            <ArrowRight className="w-5 h-5 text-brand-secondary" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-brand-text text-sm font-semibold">
              Lanjutkan progresmu
            </p>
            <p className="text-brand-text-muted text-xs">
              {completedSteps.length} dari 4 langkah selesai
            </p>
          </div>
        </Button>
      )}

      {/* Feature Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={itemVariants}
            whileHover={{ y: -3 }}
            className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-5 text-center hover:bg-brand-card-hover transition-colors"
          >
            <div className="w-12 h-12 rounded-xl bg-brand-primary-light/20 flex items-center justify-center mx-auto mb-3">
              <feature.icon className="w-6 h-6 text-brand-primary-light" />
            </div>
            <div className="text-brand-text-muted text-[10px] font-medium uppercase tracking-wider mb-1">
              Langkah {feature.step}
            </div>
            <h3 className="text-brand-text font-semibold text-sm mb-1">
              {feature.title}
            </h3>
            <p className="text-brand-text-muted text-xs leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.6 }}
      >
        <Button
          onClick={() => router.push("/gaya-belajar")}
          size="lg"
          className="bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold text-base px-8 py-6 rounded-full shadow-lg shadow-black/20 cursor-pointer"
        >
          Mulai Sekarang
        </Button>

        <p className="text-brand-text-muted text-xs mt-4">
          Hanya butuh 5 menit &middot; Gratis tanpa perlu login
        </p>
      </motion.div>
    </div>
  );
}
