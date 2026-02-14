"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CategoryScore } from "@/shared/api/types";

const CATEGORY_LABELS: Record<string, string> = {
  tech_skills: "Keterampilan Teknis",
  soft_skills: "Soft Skills",
  leadership: "Kepemimpinan",
  domain_knowledge: "Pengetahuan Domain",
  adaptation_skills: "Kemampuan Adaptasi",
};

const CATEGORY_ICONS: Record<string, string> = {
  tech_skills: "💻",
  soft_skills: "🤝",
  leadership: "👑",
  domain_knowledge: "🧠",
  adaptation_skills: "🔄",
};

interface SkillCategoryCardProps {
  categoryKey: string;
  category: CategoryScore;
  matchedSkills: string[];
}

export function SkillCategoryCard({
  categoryKey,
  category,
  matchedSkills,
}: SkillCategoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.round(category.coverage_pct * 100);

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {CATEGORY_ICONS[categoryKey] || "📌"}
          </span>
          <div className="text-left">
            <div className="text-white text-sm font-medium">
              {CATEGORY_LABELS[categoryKey] || categoryKey}
            </div>
            <div className="text-white/50 text-xs">
              {category.user_has}/{category.total_required} skill terpenuhi
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-bold ${
              percentage >= 70
                ? "text-green-400"
                : percentage >= 40
                  ? "text-yellow-400"
                  : "text-red-400"
            }`}
          >
            {percentage}%
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-white/40" />
          ) : (
            <ChevronDown className="w-4 h-4 text-white/40" />
          )}
        </div>
      </button>

      <div className="px-4 pb-1">
        <Progress value={percentage} className="h-1.5 bg-white/10" />
      </div>

      {expanded && (
        <div className="p-4 pt-3 border-t border-white/10 space-y-3">
          {matchedSkills.length > 0 && (
            <div>
              <div className="text-green-400 text-xs font-medium mb-2">
                Skill yang Dimiliki
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {category.missing.length > 0 && (
            <div>
              <div className="text-red-400 text-xs font-medium mb-2">
                Skill yang Perlu Dipelajari
              </div>
              <div className="flex flex-wrap gap-1.5">
                {category.missing.map((skill) => (
                  <Badge
                    key={skill}
                    className="bg-red-500/20 text-red-300 border-red-500/30 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
