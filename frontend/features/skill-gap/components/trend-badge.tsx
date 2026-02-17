"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { SkillDemandTrend } from "@/shared/api/types";

const TREND_CONFIG = {
  hot: {
    label: "Rising",
    icon: TrendingUp,
    bgClass: "bg-emerald-500/20",
    textClass: "text-emerald-400",
    borderClass: "border-emerald-500/30",
  },
  stable: {
    label: "Stable",
    icon: Minus,
    bgClass: "bg-brand-text-muted/10",
    textClass: "text-brand-text-muted",
    borderClass: "border-brand-text-muted/20",
  },
  declining: {
    label: "Declining",
    icon: TrendingDown,
    bgClass: "bg-red-500/20",
    textClass: "text-red-400",
    borderClass: "border-red-500/30",
  },
} as const;

interface TrendBadgeProps {
  trend: SkillDemandTrend;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function TrendBadge({
  trend,
  showLabel = true,
  size = "sm",
}: Readonly<TrendBadgeProps>) {
  const config = TREND_CONFIG[trend.predicted_trend] || TREND_CONFIG.stable;
  const Icon = config.icon;
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-medium ${config.bgClass} ${config.textClass} ${config.borderClass}`}
      title={`Demand: ${trend.current_demand} jobs | Growth: ${(trend.growth_rate * 100).toFixed(1)}%`}
    >
      <Icon className={iconSize} />
      {showLabel && config.label}
    </span>
  );
}
