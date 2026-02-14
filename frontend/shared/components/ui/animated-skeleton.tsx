"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

interface AnimatedSkeletonProps {
  /** Array of height classes for each skeleton block, e.g. ["h-40", "h-72", "h-20"] */
  blocks: string[];
}

export function AnimatedSkeleton({ blocks }: Readonly<AnimatedSkeletonProps>) {
  return (
    <motion.div
      className="space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {blocks.map((height, i) => (
        <motion.div key={i} variants={itemVariants}>
          <div
            className={`${height} w-full bg-brand-card rounded-2xl animate-pulse`}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/** Typing indicator — 3 bouncing dots */
export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-brand-text-muted"
          animate={{ y: [0, -6, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
