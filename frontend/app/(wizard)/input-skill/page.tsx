"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useWizardStore } from "@/shared/store/wizard-store";
import { apiRequest } from "@/shared/api/client";
import { API } from "@/shared/api/endpoints";
import type { SkillExtractionResponse } from "@/shared/api/types";
import { SkillTagInput } from "@/features/skill-input/components/skill-tag-input";
import { SkillQuiz } from "@/features/skill-input/components/skill-quiz";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-2xl font-bold mb-1">Input Skill</h2>
        <p className="text-white/60 text-sm">
          Masukkan skill yang kamu miliki saat ini
        </p>
      </div>

      {!extracted ? (
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="w-full bg-white/10 border border-white/20">
            <TabsTrigger
              value="manual"
              className="flex-1 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer"
            >
              Ketik Manual
            </TabsTrigger>
            <TabsTrigger
              value="quiz"
              className="flex-1 text-white/70 data-[state=active]:bg-white/20 data-[state=active]:text-white cursor-pointer"
            >
              Quiz Deteksi
            </TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5">
              <SkillTagInput tags={tags} onTagsChange={setTags} />
            </div>
            <Button
              onClick={handleManualSubmit}
              disabled={tags.length === 0 || loading}
              className="w-full bg-white text-indigo-700 hover:bg-white/90 font-semibold disabled:opacity-30 cursor-pointer"
            >
              {loading ? "Mengekstrak..." : "Ekstrak Skill"}
            </Button>
          </TabsContent>

          <TabsContent value="quiz" className="mt-4">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5">
              <SkillQuiz onComplete={handleQuizComplete} />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Show extracted results
        <div className="space-y-4">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5">
            <h3 className="text-white font-semibold text-sm mb-3">
              Skill yang Terdeteksi ({extractedSkills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {extractedSkills.map((skill) => (
                <Badge
                  key={skill.skill_id}
                  className={`${
                    skill.confidence >= 0.7
                      ? "bg-green-500/20 text-green-300 border-green-500/30"
                      : skill.confidence >= 0.5
                        ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                        : "bg-white/15 text-white/70 border-white/20"
                  }`}
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
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
          >
            Input Ulang
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full bg-white/10" />
          <Skeleton className="h-8 w-3/4 bg-white/10" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/pekerjaan-impian")}
          className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 cursor-pointer"
        >
          Kembali
        </Button>
        <Button
          onClick={handleContinue}
          disabled={extractedSkills.length === 0}
          className="flex-1 bg-white text-indigo-700 hover:bg-white/90 font-semibold disabled:opacity-30 cursor-pointer"
        >
          Analisis Skill Gap
        </Button>
      </div>
    </div>
  );
}
