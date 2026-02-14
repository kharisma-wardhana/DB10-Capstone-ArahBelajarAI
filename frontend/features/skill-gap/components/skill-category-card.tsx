"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CategoryScore } from "@/shared/api/types";

const CATEGORY_LABELS: Record<string, string> = {
  tech_skills: "Keterampilan Teknis",
  soft_skills: "Soft Skills",
  leadership: "Kepemimpinan",
  domain_knowledge: "Pengetahuan Domain",
  adaptation_skills: "Kemampuan Adaptasi",
};

const CATEGORY_ICONS: Record<string, string> = {
  tech_skills: "\u{1F4BB}",
  soft_skills: "\u{1F91D}",
  leadership: "\u{1F451}",
  domain_knowledge: "\u{1F9E0}",
  adaptation_skills: "\u{1F504}",
};

function getPercentageColor(percentage: number) {
  if (percentage >= 70) return "text-brand-secondary";
  if (percentage >= 40) return "text-brand-accent";
  return "text-red-400";
}

interface SkillCategoryCardProps {
  categoryKey: string;
  category: CategoryScore;
  matchedSkills: string[];
}

export function SkillCategoryCard({
  categoryKey,
  category,
  matchedSkills,
}: Readonly<SkillCategoryCardProps>) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.round(category.coverage_pct * 100);

  return (
    <div className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {CATEGORY_ICONS[categoryKey] || "\u{1F4CC}"}
          </span>
          <div className="text-left">
            <div className="text-brand-text text-sm font-medium">
              {CATEGORY_LABELS[categoryKey] || categoryKey}
            </div>
            <div className="text-brand-text-muted text-xs">
              {category.user_has}/{category.total_required} skill terpenuhi
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-bold ${getPercentageColor(percentage)}`}>
            {percentage}%
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-brand-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-brand-text-muted" />
          )}
        </div>
      </button>

      <div className="px-4 pb-1">
        <Progress value={percentage} className="h-1.5 bg-brand-card-border" />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-3 border-t border-brand-card-border space-y-3">
              {matchedSkills.length > 0 && (
                <div>
                  <div className="text-brand-secondary text-xs font-medium mb-2">
                    Skill yang Dimiliki
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-brand-secondary/20 text-brand-secondary border-brand-secondary/30 text-xs"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
