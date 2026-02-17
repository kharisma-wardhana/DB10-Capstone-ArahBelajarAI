"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type {
  SkillDemandTrend,
  SkillGapResponse,
  RoadmapResponse,
} from "@/shared/api/types";
import { SkillRadarChart } from "@/features/skill-gap/components/radar-chart";
import { ReadinessGauge } from "@/features/skill-gap/components/readiness-gauge";
import { SkillCategoryCard } from "@/features/skill-gap/components/skill-category-card";
import { SkillPriorityChart } from "@/features/skill-gap/components/skill-priority-chart";
import { RoadmapTimeline } from "@/features/roadmap/components/roadmap-timeline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageTransition } from "@/shared/components/layout/page-transition";
import { AnimatedSkeleton } from "@/shared/components/ui/animated-skeleton";
import { motion } from "framer-motion";
import { Map } from "lucide-react";

export default function HasilAnalisisPage() {
  const router = useRouter();
  const {
    extractedSkills,
    selectedJobTitle,
    gapResult,
    setGapResult,
    completeStep,
    vakResult,
  } = useWizardStore();

  const [loading, setLoading] = useState(!gapResult);
  const [error, setError] = useState<string | null>(null);

  // Roadmap state
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);
  const [roadmapOpen, setRoadmapOpen] = useState(false);

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

  // Build a lookup map: skill name (lowercase) → demand trend
  const skillTrends = useMemo(() => {
    if (!gapResult) return {};
    const map: Record<string, SkillDemandTrend> = {};
    for (const m of gapResult.matched_skills) {
      if (m.demand_trend) {
        map[m.required_skill.toLowerCase()] = m.demand_trend;
      }
    }
    for (const m of gapResult.missing_skills) {
      if (m.demand_trend) {
        map[m.skill_name.toLowerCase()] = m.demand_trend;
      }
    }
    return map;
  }, [gapResult]);

  // Generate roadmap handler
  const generateRoadmap = useCallback(() => {
    if (!gapResult || gapResult.missing_skills.length === 0) return;

    // If already generated, just open the modal
    if (roadmap) {
      setRoadmapOpen(true);
      return;
    }

    setRoadmapLoading(true);
    setRoadmapError(null);

    const missingSkills = gapResult.missing_skills.map((s) => ({
      skill_name: s.skill_name,
      category: s.category,
      frequency: s.frequency,
      priority_score: s.priority_score ?? s.frequency,
    }));

    apiRequest<RoadmapResponse>(API.ROADMAP_GENERATE, {
      method: "POST",
      body: JSON.stringify({
        missing_skills: missingSkills,
        vak_style: vakResult?.dominant ?? null,
        job_title: gapResult.job_title_matched,
      }),
    })
      .then((data) => {
        setRoadmap(data);
        setRoadmapOpen(true);
      })
      .catch((err) => {
        setRoadmapError(
          err instanceof Error ? err.message : "Gagal membuat roadmap",
        );
      })
      .finally(() => setRoadmapLoading(false));
  }, [gapResult, vakResult, roadmap]);

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

        {/* SkillPulse: Priority Chart */}
        <SkillPriorityChart missingSkills={gapResult.missing_skills} />

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
                skillTrends={skillTrends}
              />
            ))}
          </div>
        </div>

        {/* Learning Roadmap Section */}
        {gapResult.missing_skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={generateRoadmap}
              disabled={roadmapLoading}
              className="w-full bg-brand-primary text-white hover:bg-brand-primary/90 font-semibold cursor-pointer"
            >
              <Map className="w-4 h-4 mr-2" />
              {roadmapLoading && "Membuat Roadmap..."}
              {!roadmapLoading && roadmap && "Lihat Roadmap Belajar"}
              {!roadmapLoading && !roadmap && "Buat Roadmap Belajar"}
            </Button>
            <p className="text-brand-text-muted text-xs text-center mt-2">
              Rekomendasi kursus dari Coursera & Udemy berdasarkan gaya
              belajar {vakResult?.dominant ? `(${vakResult.dominant})` : ""} kamu
            </p>
            {roadmapError && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm mt-2">
                {roadmapError}
              </div>
            )}
          </motion.div>
        )}

        {/* Roadmap Dialog */}
        <Dialog open={roadmapOpen} onOpenChange={setRoadmapOpen}>
          <DialogContent className="bg-brand-bg border-brand-card-border max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-brand-text">
                Roadmap Belajar — {gapResult.job_title_matched}
              </DialogTitle>
            </DialogHeader>
            {roadmap && (
              <div className="space-y-4">
                <div className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-xl p-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-brand-primary-light text-lg font-bold">
                        {roadmap.total_skills}
                      </div>
                      <div className="text-brand-text-muted text-xs">
                        Skill Tercakup
                      </div>
                    </div>
                    <div>
                      <div className="text-brand-accent text-lg font-bold">
                        {roadmap.total_courses}
                      </div>
                      <div className="text-brand-text-muted text-xs">
                        Kursus Direkomendasikan
                      </div>
                    </div>
                  </div>
                </div>
                <RoadmapTimeline
                  phases={roadmap.phases}
                  vakStyle={roadmap.vak_style}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>

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
