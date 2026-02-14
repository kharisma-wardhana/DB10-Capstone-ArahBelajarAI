"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { SkillGapResponse } from "@/shared/api/types";
import { SkillRadarChart } from "@/features/skill-gap/components/radar-chart";
import { ReadinessGauge } from "@/features/skill-gap/components/readiness-gauge";
import { SkillCategoryCard } from "@/features/skill-gap/components/skill-category-card";

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
  }, [gapResult, selectedJobTitle, extractedSkills, setGapResult, completeStep]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full bg-white/10 rounded-2xl" />
        <Skeleton className="h-72 w-full bg-white/10 rounded-2xl" />
        <Skeleton className="h-20 w-full bg-white/10 rounded-xl" />
        <Skeleton className="h-20 w-full bg-white/10 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          {error}
        </div>
        <Button
          onClick={() => router.push("/input-skill")}
          className="w-full bg-white text-indigo-700 hover:bg-white/90 cursor-pointer"
        >
          Kembali ke Input Skill
        </Button>
      </div>
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
    <div className="space-y-5">
      <div>
        <h2 className="text-white text-2xl font-bold mb-1">Hasil Analisis</h2>
        <p className="text-white/60 text-sm">
          Skill gap kamu untuk posisi{" "}
          <span className="text-white font-medium">
            {gapResult.job_title_matched}
          </span>
        </p>
      </div>

      {/* Readiness Gauge */}
      <ReadinessGauge
        score={gapResult.overall_readiness_score}
        jobTitle={gapResult.job_title_matched}
      />

      {/* Radar Chart */}
      <SkillRadarChart categoryBreakdown={gapResult.category_breakdown} />

      {/* Category Breakdown */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-3">
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

      {/* Summary Stats */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-green-400 text-xl font-bold">
              {gapResult.matched_skills.length}
            </div>
            <div className="text-white/50 text-xs">Skill Cocok</div>
          </div>
          <div>
            <div className="text-red-400 text-xl font-bold">
              {gapResult.missing_skills.length}
            </div>
            <div className="text-white/50 text-xs">Perlu Dipelajari</div>
          </div>
          <div>
            <div className="text-blue-400 text-xl font-bold">
              {Math.round(gapResult.job_title_confidence * 100)}%
            </div>
            <div className="text-white/50 text-xs">Akurasi Job</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/input-skill")}
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
        >
          Ubah Skill
        </Button>
        <Button
          onClick={() => router.push("/interview")}
          className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold cursor-pointer"
        >
          Mock Interview
        </Button>
      </div>
    </div>
  );
}
