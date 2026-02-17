"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, BookOpen, GraduationCap, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RoadmapPhase } from "@/shared/api/types";
import { CourseCard } from "./course-card";

const PHASE_ICONS = [BookOpen, GraduationCap, Rocket];
const PHASE_COLORS = [
  "border-blue-500/50 bg-blue-500/10",
  "border-brand-accent/50 bg-brand-accent/10",
  "border-emerald-500/50 bg-emerald-500/10",
];
const PHASE_DOT_COLORS = [
  "bg-blue-500",
  "bg-brand-accent",
  "bg-emerald-500",
];

interface PhaseCardProps {
  phase: RoadmapPhase;
  index: number;
  isLast: boolean;
}

function PhaseCard({ phase, index, isLast }: Readonly<PhaseCardProps>) {
  const [expanded, setExpanded] = useState(index === 0);
  const Icon = PHASE_ICONS[index] || BookOpen;

  return (
    <motion.div
      className="relative pl-8"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.15 }}
    >
      {/* Timeline dot and line */}
      <div className="absolute left-0 top-0 flex flex-col items-center">
        <div className={`w-4 h-4 rounded-full ${PHASE_DOT_COLORS[index]} flex items-center justify-center ring-4 ring-brand-bg`}>
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-brand-card-border min-h-[40px]" />
        )}
      </div>

      {/* Phase content */}
      <div className={`backdrop-blur-xl border rounded-xl overflow-hidden mb-4 ${PHASE_COLORS[index]}`}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-brand-text" />
            <div className="text-left">
              <div className="text-brand-text text-sm font-semibold">
                Fase {phase.phase}: {phase.name}
              </div>
              <div className="text-brand-text-muted text-xs">
                {phase.weeks} &middot; {phase.skills.length} skill
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand-card border-brand-card-border text-brand-text-muted text-[10px]">
              {phase.skills.reduce((sum, s) => sum + s.courses.length, 0)} kursus
            </Badge>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-brand-text-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-brand-text-muted" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {phase.skills.map((skill) => (
                  <div key={skill.skill_name}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-brand-text text-xs font-medium">
                        {skill.skill_name}
                      </span>
                      <Badge className="bg-brand-card-border text-brand-text-muted border-0 text-[10px] px-1.5 py-0">
                        {skill.category.replace("_", " ")}
                      </Badge>
                    </div>
                    {skill.courses.length > 0 ? (
                      <div className="grid gap-2">
                        {skill.courses.map((course) => (
                          <CourseCard key={course.title} course={course} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-brand-text-muted text-xs italic">
                        Belum ada rekomendasi kursus untuk skill ini.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface RoadmapTimelineProps {
  phases: RoadmapPhase[];
  vakStyle?: string | null;
}

export function RoadmapTimeline({ phases, vakStyle }: Readonly<RoadmapTimelineProps>) {
  if (phases.length === 0) return null;

  const VAK_LABELS: Record<string, string> = {
    visual: "Visual",
    auditory: "Auditori",
    kinesthetic: "Kinestetik",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brand-text font-semibold text-sm">
          Roadmap Belajar
        </h3>
        {vakStyle && (
          <Badge className="bg-brand-primary/20 text-brand-primary-light border-brand-primary/30 text-[10px]">
            Gaya: {VAK_LABELS[vakStyle] || vakStyle}
          </Badge>
        )}
      </div>
      <div>
        {phases.map((phase, idx) => (
          <PhaseCard
            key={phase.phase}
            phase={phase}
            index={idx}
            isLast={idx === phases.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
