"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { SkillExtractionResponse } from "@/shared/api/types";
import { SkillTagInput } from "@/features/skill-input/components/skill-tag-input";
import { SkillQuiz } from "@/features/skill-input/components/skill-quiz";
import { PageTransition } from "@/shared/components/layout/page-transition";
import { AnimatedSkeleton } from "@/shared/components/ui/animated-skeleton";
import { motion } from "framer-motion";

function getConfidenceBadgeClass(confidence: number) {
  if (confidence >= 0.7) return "bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30";
  if (confidence >= 0.5) return "bg-brand-accent/20 text-brand-accent border-brand-accent/30";
  return "bg-brand-card text-brand-text-muted border-brand-card-border";
}

export default function InputSkillPage() {
  const router = useRouter();
  const { extractedSkills, setExtractedSkills, setRawSkillInput, completeStep } =
    useWizardStore();

  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState(extractedSkills.length > 0);

  async function handleExtract(skillList: string[]) {
    if (skillList.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const text = skillList.join(", ");
      setRawSkillInput(text);
      const data = await apiRequest<SkillExtractionResponse>(
        API.SKILLS_EXTRACT,
        {
          method: "POST",
          body: JSON.stringify({ text, mode: "skill_list" }),
        },
      );
      setExtractedSkills(data.skills);
      setExtracted(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengekstrak skill",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleQuizComplete(skills: string[]) {
    handleExtract(skills);
  }

  function handleManualSubmit() {
    handleExtract(tags);
  }

  function handleContinue() {
    completeStep(3);
    router.push("/hasil-analisis");
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="text-brand-text text-2xl font-bold mb-1">Input Skill</h2>
          <p className="text-brand-text-muted text-sm">
            Masukkan skill yang kamu miliki saat ini
          </p>
        </div>

        {!extracted ? (
          <Tabs defaultValue="quiz" className="w-full">
            <TabsList className="w-full bg-brand-card border border-brand-card-border">
              <TabsTrigger
                value="quiz"
                className="flex-1 text-brand-text-muted data-[state=active]:bg-brand-card-hover data-[state=active]:text-brand-text cursor-pointer"
              >
                Quiz Deteksi
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className="flex-1 text-brand-text-muted data-[state=active]:bg-brand-card-hover data-[state=active]:text-brand-text cursor-pointer"
              >
                Ketik Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quiz" className="mt-4">
              <div className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-5">
                <SkillQuiz onComplete={handleQuizComplete} />
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 mt-4">
              <div className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-5">
                <SkillTagInput tags={tags} onTagsChange={setTags} />
              </div>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={handleManualSubmit}
                  disabled={tags.length === 0 || loading}
                  className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold disabled:opacity-30 cursor-pointer"
                >
                  {loading ? "Mengekstrak..." : "Ekstrak Skill"}
                </Button>
              </motion.div>
            </TabsContent>
          </Tabs>
        ) : (
          // Show extracted results
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-5">
              <h3 className="text-brand-text font-semibold text-sm mb-3">
                Skill yang Terdeteksi ({extractedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill) => (
                  <Badge
                    key={skill.skill_id}
                    className={getConfidenceBadgeClass(skill.confidence)}
                  >
                    {skill.skill_name}
                    <span className="ml-1 opacity-60 text-xs">
                      {Math.round(skill.confidence * 100)}%
                    </span>
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setExtracted(false);
                setExtractedSkills([]);
              }}
              className="w-full bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover cursor-pointer"
            >
              Input Ulang
            </Button>
          </motion.div>
        )}

        {loading && <AnimatedSkeleton blocks={["h-8", "h-8"]} />}

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/pekerjaan-impian")}
            className="flex-1 bg-brand-card border-brand-card-border text-brand-text hover:bg-brand-card-hover cursor-pointer"
          >
            Kembali
          </Button>
          <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
            <Button
              onClick={handleContinue}
              disabled={extractedSkills.length === 0}
              className="w-full bg-brand-cta-bg text-brand-cta-text hover:bg-brand-cta-hover font-semibold disabled:opacity-30 cursor-pointer"
            >
              Analisis Skill Gap
            </Button>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
