"use client";

import { ExternalLink, Users, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { CourseRecommendation } from "@/shared/api/types";

const PLATFORM_STYLES: Record<string, { bg: string; text: string }> = {
  Coursera: { bg: "bg-blue-500/20", text: "text-blue-400" },
  Udemy: { bg: "bg-purple-500/20", text: "text-purple-400" },
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

interface CourseCardProps {
  course: CourseRecommendation;
}

export function CourseCard({ course }: Readonly<CourseCardProps>) {
  const platformStyle = PLATFORM_STYLES[course.platform] || PLATFORM_STYLES.Coursera;
  const matchPercent = Math.round(course.match_score * 100);

  return (
    <a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block backdrop-blur-xl bg-brand-card/50 border border-brand-card-border rounded-lg p-3 hover:bg-brand-card-hover transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-brand-text text-xs font-medium leading-tight line-clamp-2 flex-1">
          {course.title}
        </h4>
        <ExternalLink className="w-3 h-3 text-brand-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge className={`${platformStyle.bg} ${platformStyle.text} border-0 text-[10px] px-1.5 py-0`}>
          {course.platform}
        </Badge>
        <Badge className="bg-brand-primary/20 text-brand-primary-light border-0 text-[10px] px-1.5 py-0">
          {matchPercent}% cocok
        </Badge>
        {course.level && course.level !== "All Levels" && (
          <Badge className="bg-brand-card-border text-brand-text-muted border-0 text-[10px] px-1.5 py-0">
            {course.level}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3 mt-2 text-brand-text-muted text-[10px]">
        {course.subscribers > 0 && (
          <span className="flex items-center gap-0.5">
            <Users className="w-2.5 h-2.5" />
            {formatNumber(course.subscribers)}
          </span>
        )}
        {course.content_hours > 0 && (
          <span className="flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {course.content_hours}h
          </span>
        )}
        {course.reviews > 0 && (
          <span className="flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5" />
            {formatNumber(course.reviews)}
          </span>
        )}
      </div>
    </a>
  );
}
