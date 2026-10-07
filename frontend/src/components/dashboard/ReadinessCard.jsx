import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Sparkles, CheckCircle2 } from "lucide-react";

export default function ReadinessCard({
  readinessScore = 82,
  readinessLabel = "Almost Ready",
  readinessSource = "ml",
}) {
  const [animatedNumber, setAnimatedNumber] = useState(0);
  const [showStatus, setShowStatus] = useState(false);

  const targetScore = Math.max(0, Math.min(100, Number(readinessScore) || 78));

  // Circular gauge geometry
  const size = 150;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1200;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedNumber(Math.round(targetScore * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setShowStatus(true);
      }
    };

    const frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetScore]);

  // Insight message based on readiness
  let insightText = "You're improving consistently. Focus on communication and problem-solving to reach the next level.";
  if (targetScore >= 80) {
    insightText = "High interview readiness. Your technical responses and communication benchmarks are consistently competitive.";
  } else if (targetScore < 60) {
    insightText = "Foundational stage. Focus on question structure and confidence to accelerate your interview readiness.";
  }

  return (
    <div className="card-saas flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Interview Readiness
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700">
            <Sparkles className="h-3 w-3 text-violet-600" />
            {readinessSource === "ml" ? "ML Prediction" : "Rule Engine"}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Evaluated against hiring benchmark standards.
        </p>
      </div>

      {/* Circular Animated Progress Ring */}
      <div className="my-6 flex flex-col items-center justify-center">
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <defs>
              <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4f46e5" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Background Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Animated Progress Ring */}
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="url(#readinessGrad)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              filter="url(#ringGlow)"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - targetScore / 100) }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>

          {/* Centered Values */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="font-display text-4xl font-extrabold tracking-tight text-slate-900">
              {animatedNumber}%
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Readiness
            </span>
          </div>
        </div>

        {/* Status text fading in afterward */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showStatus ? 1 : 0.4, y: showStatus ? 0 : 4 }}
          transition={{ duration: 0.4 }}
          className="mt-3 flex items-center gap-1.5"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            <Award className="h-3.5 w-3.5" />
            {readinessLabel}
          </span>
        </motion.div>
      </div>

      {/* Supporting diagnostic card */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-indigo-100 text-indigo-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            {insightText}
          </p>
        </div>
      </div>
    </div>
  );
}
