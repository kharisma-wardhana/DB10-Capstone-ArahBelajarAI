"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
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

export function SkillRadarChart({ categoryBreakdown }: SkillRadarChartProps) {
  const data = Object.entries(categoryBreakdown).map(([key, cat]) => ({
    category: CATEGORY_LABELS[key] || key,
    coverage: Math.round(cat.coverage_pct * 100),
    fullMark: 100,
  }));

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4">
      <h3 className="text-white font-semibold text-sm mb-2 text-center">
        Radar Skill Gap
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.15)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
          />
          <Radar
            name="Coverage"
            dataKey="coverage"
            stroke="#818cf8"
            fill="url(#radarGradient)"
            fillOpacity={0.6}
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
