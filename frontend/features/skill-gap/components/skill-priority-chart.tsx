"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import type { MissingSkill } from "@/shared/api/types";

interface SkillPriorityChartProps {
  missingSkills: MissingSkill[];
}

interface ChartPoint {
  name: string;
  frequency: number;
  growthRate: number;
  priority: number;
}

function getPointColor(growthRate: number, frequency: number): string {
  if (growthRate > 0.02 && frequency > 0.3) return "var(--color-brand-secondary, #22c55e)";
  if (growthRate > 0.01) return "var(--color-brand-accent, #f59e0b)";
  return "var(--color-brand-text-muted, #94a3b8)";
}

export function SkillPriorityChart({
  missingSkills,
}: Readonly<SkillPriorityChartProps>) {
  const data: ChartPoint[] = missingSkills
    .filter((s) => s.demand_trend)
    .slice(0, 15)
    .map((s) => ({
      name: s.skill_name,
      frequency: Math.round(s.frequency * 100),
      growthRate: Number((s.demand_trend!.growth_rate * 100).toFixed(1)),
      priority: s.priority_score ?? s.frequency,
    }));

  if (data.length === 0) return null;

  return (
    <motion.div
      className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-xl p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <h3 className="text-brand-text font-semibold text-sm mb-1">
        Prioritas Belajar
      </h3>
      <p className="text-brand-text-muted text-xs mb-3">
        Skill di kanan atas = paling penting untuk dipelajari
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
          <XAxis
            dataKey="frequency"
            name="Frekuensi"
            unit="%"
            type="number"
            tick={{ fill: "var(--color-brand-text-muted, #94a3b8)", fontSize: 10 }}
            axisLine={{ stroke: "var(--color-brand-card-border, #334155)" }}
            label={{
              value: "Frekuensi di Lowongan (%)",
              position: "insideBottom",
              offset: -10,
              fill: "var(--color-brand-text-muted, #94a3b8)",
              fontSize: 10,
            }}
          />
          <YAxis
            dataKey="growthRate"
            name="Growth"
            unit="%"
            type="number"
            tick={{ fill: "var(--color-brand-text-muted, #94a3b8)", fontSize: 10 }}
            axisLine={{ stroke: "var(--color-brand-card-border, #334155)" }}
            label={{
              value: "Growth Rate (%)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "var(--color-brand-text-muted, #94a3b8)",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={0}
            stroke="var(--color-brand-card-border, #334155)"
            strokeDasharray="3 3"
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as ChartPoint;
              return (
                <div className="bg-brand-card border border-brand-card-border rounded-lg p-2 shadow-lg">
                  <div className="text-brand-text text-xs font-medium">{d.name}</div>
                  <div className="text-brand-text-muted text-[10px]">
                    Frekuensi: {d.frequency}% | Growth: {d.growthRate}%
                  </div>
                </div>
              );
            }}
          />
          <Scatter data={data} fill="#8884d8">
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={getPointColor(entry.growthRate / 100, entry.frequency / 100)}
                r={6}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
