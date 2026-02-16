"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { SkillGapResponse } from "@/shared/api/types";
import { SkillRadarChart } from "@/features/skill-gap/components/radar-chart";
import { ReadinessGauge } from "@/features/skill-gap/components/readiness-gauge";
import { SkillCategoryCard } from "@/features/skill-gap/components/skill-category-card";
import { PageTransition } from "@/shared/components/layout/page-transition";
import { AnimatedSkeleton } from "@/shared/components/ui/animated-skeleton";
import { motion } from "framer-motion";

export default function HasilAnalisisPage() {
  const router = useRouter();
  const {
    extractedSkills,
    selectedJobTitle,
    gapResult,
    setGapResult,
    completeStep,
  } = useWizardStore();

  const [loading, setLoading] = useState(!gapResult);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (gapResult || !selectedJobTitle || extractedSkills.length === 0) return;

    setLoading(true);
    const userSkills = extractedSkills.map((s) => s.skill_name).join(", ");

    apiRequest<SkillGapResponse>(API.SKILLS_GAP_ANALYSIS, {
      method: "POST",
      body: JSON.stringify({
        user_skills: userSkills,
        job_title: selectedJobTitle,
      }),
    })
      .then((data) => {
        setGapResult(data);
        completeStep(4);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Gagal menganalisis skill gap",
        );
      })
      .finally(() => setLoading(false));
  }, [
    gapResult,
    selectedJobTitle,
    extractedSkills,
    setGapResult,
    completeStep,
  ]);

  if (loading) {
    return <AnimatedSkeleton blocks={["h-40", "h-72", "h-20", "h-20"]} />;
  }

  if (error) {
    return (
      <PageTransition>
        <div className="space-y-4 px-4 pb-safe">
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
            {error}
          </div>
          <Button
            onClick={() => router.push("/input-skill")}
            className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover cursor-pointer"
          >
            Kembali ke Input Skill
          </Button>
        </div>
      </PageTransition>
    );
  }

  if (!gapResult) return null;

  // Compute matched skills per category
  const matchedByCategory: Record<string, string[]> = {};
  for (const matched of gapResult.matched_skills) {
    if (!matchedByCategory[matched.category]) {
      matchedByCategory[matched.category] = [];
    }
    matchedByCategory[matched.category].push(matched.required_skill);
  }

  return (
    <PageTransition>
      <div className="space-y-5 p-4 md:p-8 pb-safe">
        <div>
          <h2 className="text-brand-text text-2xl font-bold mb-1">
            Hasil Analisis
          </h2>
          <p className="text-brand-text-muted text-sm">
            Skill gap kamu untuk posisi{" "}
            <span className="text-brand-text font-medium">
              {gapResult.job_title_matched}
            </span>
          </p>
        </div>

        {/* Readiness Gauge */}
        <ReadinessGauge
          score={gapResult.overall_readiness_score}
          jobTitle={gapResult.job_title_matched}
        />

        {/* Summary Stats */}
        <motion.div
          className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-xl p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-brand-secondary text-xl font-bold">
                {gapResult.matched_skills.length}
              </div>
              <div className="text-brand-text-muted text-xs">Skill Cocok</div>
            </div>
            <div>
              <div className="text-red-400 text-xl font-bold">
                {gapResult.missing_skills.length}
              </div>
              <div className="text-brand-text-muted text-xs">
                Perlu Dipelajari
              </div>
            </div>
            <div>
              <div className="text-brand-primary-light text-xl font-bold">
                {Math.round(gapResult.job_title_confidence * 100)}%
              </div>
              <div className="text-brand-text-muted text-xs">Akurasi Job</div>
            </div>
          </div>
        </motion.div>

        {/* Radar Chart */}
        <SkillRadarChart categoryBreakdown={gapResult.category_breakdown} />

        {/* Category Breakdown */}
        <div>
          <h3 className="text-brand-text font-semibold text-sm mb-3">
            Detail per Kategori
          </h3>
          <div className="space-y-3">
            {Object.entries(gapResult.category_breakdown).map(([key, cat]) => (
              <SkillCategoryCard
                key={key}
                categoryKey={key}
                category={cat}
                matchedSkills={matchedByCategory[key] || []}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/input-skill")}
            className="flex-1 bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover cursor-pointer"
          >
            Ubah Skill
          </Button>
          <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => router.push("/interview")}
              className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold cursor-pointer"
            >
              Mock Interview
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
