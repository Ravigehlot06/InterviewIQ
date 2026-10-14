import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReadinessCard({
  readinessScore = 0,
  readinessLabel = "Not Yet Assessed",
  readinessSource = "ml",
}) {
  const [animatedNumber, setAnimatedNumber] = useState(0);
  const [showStatus, setShowStatus] = useState(false);

  // Parse score safely: preserve 0 without falling back to any dummy number
  const numericScore = typeof readinessScore === "number" ? readinessScore : Number(readinessScore);
  const targetScore = Number.isFinite(numericScore) ? Math.max(0, Math.min(100, Math.round(numericScore))) : 0;

  // Geometry
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

  // Determine stage visual styling and actionable diagnostic advice
  const getTierConfig = (score) => {
    if (score >= 80) {
      return {
        gradId: "readinessGradEmerald",
        stop1: "#10b981",
        stop2: "#059669",
        glow: "#10b981",
        badgeBg: "bg-emerald-50",
        badgeText: "text-emerald-700",
        badgeBorder: "border-emerald-200",
        iconBg: "bg-emerald-100",
        iconText: "text-emerald-700",
        defaultLabel: "Interview Ready",
        insight:
          "High interview readiness. Your technical responses and communication benchmarks are consistently competitive for top hiring standards.",
      };
    }
    if (score >= 60) {
      return {
        gradId: "readinessGradIndigo",
        stop1: "#6366f1",
        stop2: "#7c3aed",
        glow: "#7c3aed",
        badgeBg: "bg-indigo-50",
        badgeText: "text-indigo-700",
        badgeBorder: "border-indigo-200",
        iconBg: "bg-indigo-100",
        iconText: "text-indigo-700",
        defaultLabel: "Almost Ready",
        insight:
          "Competitive stage. Solid performance across competencies. Fine-tune technical depth and delivery pacing to reach top hiring readiness.",
      };
    }
    if (score >= 40) {
      return {
        gradId: "readinessGradSky",
        stop1: "#3b82f6",
        stop2: "#0284c7",
        glow: "#0284c7",
        badgeBg: "bg-blue-50",
        badgeText: "text-blue-700",
        badgeBorder: "border-blue-200",
        iconBg: "bg-blue-100",
        iconText: "text-blue-700",
        defaultLabel: "Needs Practice",
        insight:
          "Developing stage. Focus on structured STAR framework delivery, answer depth, and communication confidence to transition into interview readiness.",
      };
    }
    // score < 40 (Early Stage)
    return {
      gradId: "readinessGradAmber",
      stop1: "#f59e0b",
      stop2: "#ea580c",
      glow: "#ea580c",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-700",
      badgeBorder: "border-amber-200",
      iconBg: "bg-amber-100",
      iconText: "text-amber-700",
      defaultLabel: "Early Stage",
      insight:
        score === 0
          ? "Complete your mock practice sessions to generate your hiring benchmark readiness score."
          : "Early preparation stage. Build core fundamentals, practice structured answers, and complete more sessions to build readiness momentum.",
    };
  };

  const tier = getTierConfig(targetScore);
  const displayLabel = readinessLabel && readinessLabel !== "Not Yet Assessed" ? readinessLabel : tier.defaultLabel;

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
              <linearGradient id={tier.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tier.stop1} />
                <stop offset="100%" stopColor={tier.stop2} />
              </linearGradient>
              <filter id="ringGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={tier.glow} floodOpacity="0.3" />
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
              stroke={`url(#${tier.gradId})`}
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
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder}`}>
            <Award className="h-3.5 w-3.5" />
            {displayLabel}
          </span>
        </motion.div>
      </div>

      {/* Supporting diagnostic card */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
        <div className="flex items-start gap-2.5">
          <div className={`mt-0.5 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full ${tier.iconBg} ${tier.iconText}`}>
            {targetScore < 40 ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          </div>
          <p className="text-xs leading-relaxed text-slate-600">
            {tier.insight}
          </p>
        </div>
      </div>
    </div>
  );
}
