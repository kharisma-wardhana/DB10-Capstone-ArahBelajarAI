"use client";

import { TOP_JOBS_INDONESIA_2025 } from "../data/top-jobs-id-2025";
import { motion } from "framer-motion";

interface TopJobsGridProps {
  selectedJob: string | null;
  onSelect: (title: string) => void;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 },
};

export function TopJobsGrid({ selectedJob, onSelect }: Readonly<TopJobsGridProps>) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {TOP_JOBS_INDONESIA_2025.map((job) => (
        <motion.button
          key={job.title}
          variants={itemVariants}
          whileTap={{ scale: 0.96 }}
          onClick={() => onSelect(job.title)}
          className={`p-4 min-h-12 rounded-xl border text-left transition-colors cursor-pointer ${
            selectedJob === job.title
              ? "bg-brand-card-hover border-brand-primary-light/50 shadow-lg"
              : "bg-brand-card/50 border-brand-card-border hover:bg-brand-card-hover"
          }`}
        >
          <div className="text-2xl mb-2">{job.icon}</div>
          <div className="text-brand-text text-sm font-medium">{job.title}</div>
        </motion.button>
      ))}
    </motion.div>
  );
}
