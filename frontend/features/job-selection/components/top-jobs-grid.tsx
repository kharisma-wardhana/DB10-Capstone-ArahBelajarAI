"use client";

import { TOP_JOBS_INDONESIA_2025 } from "../data/top-jobs-id-2025";

interface TopJobsGridProps {
  selectedJob: string | null;
  onSelect: (title: string) => void;
}

export function TopJobsGrid({ selectedJob, onSelect }: TopJobsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {TOP_JOBS_INDONESIA_2025.map((job) => (
        <button
          key={job.title}
          onClick={() => onSelect(job.title)}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            selectedJob === job.title
              ? "bg-white/25 border-white/50 shadow-lg"
              : "bg-white/5 border-white/10 hover:bg-white/15"
          }`}
        >
          <div className="text-2xl mb-2">{job.icon}</div>
          <div className="text-white text-sm font-medium">{job.title}</div>
        </button>
      ))}
    </div>
  );
}
