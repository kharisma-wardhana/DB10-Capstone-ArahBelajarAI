"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import type { CategoryScore } from "@/shared/api/types";

const CATEGORY_LABELS: Record<string, string> = {
  tech_skills: "Teknis",
  soft_skills: "Soft Skills",
  leadership: "Kepemimpinan",
  domain_knowledge: "Domain",
  adaptation_skills: "Adaptasi",
};

interface SkillRadarChartProps {
  categoryBreakdown: Record<string, CategoryScore>;
}

export function SkillRadarChart({ categoryBreakdown }: Readonly<SkillRadarChartProps>) {
  const data = Object.entries(categoryBreakdown).map(([key, cat]) => ({
    category: CATEGORY_LABELS[key] || key,
    coverage: Math.round(cat.coverage_pct * 100),
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-4"
    >
      <h3 className="text-brand-text font-semibold text-sm mb-2 text-center">
        Radar Skill Gap
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--brand-card-border)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "var(--brand-text)", fontSize: 12, opacity: 0.7 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "var(--brand-text)", fontSize: 10, opacity: 0.4 }}
          />
          <Radar
            name="Coverage"
            dataKey="coverage"
            stroke="var(--brand-primary)"
            fill="url(#radarGradient)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-primary)" stopOpacity={0.8} />
              <stop offset="100%" stopColor="var(--brand-primary)" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
