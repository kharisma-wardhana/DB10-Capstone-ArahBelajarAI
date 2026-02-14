"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface ReadinessGaugeProps {
  score: number; // 0-1
  jobTitle: string;
}

function getScoreStyle(percentage: number) {
  if (percentage >= 70) return { ring: "text-brand-secondary", label: "Siap!" };
  if (percentage >= 40) return { ring: "text-brand-accent", label: "Cukup Siap" };
  return { ring: "text-red-400", label: "Perlu Belajar" };
}

function AnimatedScore({ target }: Readonly<{ target: number }>) {
  const [display, setDisplay] = useState(0);
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));

  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    const controls = animate(motionVal, target, { duration: 1.2, ease: "easeOut" });
    return () => { unsubscribe(); controls.stop(); };
  }, [target, motionVal, rounded]);

  return <>{display}</>;
}

export function ReadinessGauge({ score, jobTitle }: Readonly<ReadinessGaugeProps>) {
  const percentage = Math.round(score * 100);
  const style = getScoreStyle(percentage);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="backdrop-blur-xl bg-brand-card border border-brand-card-border rounded-2xl p-6 flex flex-col items-center"
    >
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            className="stroke-brand-card-border"
            strokeWidth="8"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            className={style.ring}
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-brand-text text-3xl font-bold">
            <AnimatedScore target={percentage} />%
          </span>
          <span className={`text-sm font-medium ${style.ring}`}>
            {style.label}
          </span>
        </div>
      </div>
      <p className="text-brand-text-muted text-sm mt-3 text-center">
        Kesiapan untuk <span className="text-brand-text font-medium">{jobTitle}</span>
      </p>
    </motion.div>
  );
}
