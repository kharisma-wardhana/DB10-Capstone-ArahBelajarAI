"use client";

interface ReadinessGaugeProps {
  score: number; // 0-1
  jobTitle: string;
}

export function ReadinessGauge({ score, jobTitle }: ReadinessGaugeProps) {
  const percentage = Math.round(score * 100);

  const getColor = () => {
    if (percentage >= 70) return { ring: "text-green-400", bg: "text-green-400/20" };
    if (percentage >= 40) return { ring: "text-yellow-400", bg: "text-yellow-400/20" };
    return { ring: "text-red-400", bg: "text-red-400/20" };
  };

  const getLabel = () => {
    if (percentage >= 70) return "Siap!";
    if (percentage >= 40) return "Cukup Siap";
    return "Perlu Belajar";
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            className={color.ring}
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-3xl font-bold">{percentage}%</span>
          <span className={`text-sm font-medium ${color.ring}`}>
            {getLabel()}
          </span>
        </div>
      </div>
      <p className="text-white/60 text-sm mt-3 text-center">
        Kesiapan untuk <span className="text-white font-medium">{jobTitle}</span>
      </p>
    </div>
  );
}
