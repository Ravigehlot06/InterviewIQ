import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Target, Flame, Award, TrendingUp, TrendingDown, Sparkles } from "lucide-react";

function AnimatedNumber({ value, suffix = "", duration = 900 }) {
  const target = Number(value) || 0;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      return;
    }
    let startTimestamp = null;
    let frameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(target * eased));
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };
    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return <span>{displayValue}{suffix}</span>;
}

export default function QuickStats({ stats }) {
  const {
    interviewCount = 0,
    averageScore = 0,
    readinessLabel = "Not Yet Assessed",
    readinessScore = 0,
    streakDays = 0,
    improvement = null,
  } = stats || {};

  const hasInterviews = interviewCount > 0;

  const statItems = [
    {
      id: "interviews",
      label: "Interviews Completed",
      valueComponent: <AnimatedNumber value={interviewCount} />,
      sublabel: hasInterviews ? "Total practice sessions" : "No practice sessions yet",
      icon: Briefcase,
      iconBg: "bg-indigo-50 text-indigo-600",
      accentBorder: "group-hover:border-indigo-200",
    },
    {
      id: "avg-score",
      label: "Average Score",
      valueComponent: hasInterviews ? (
        <AnimatedNumber value={averageScore} suffix="%" />
      ) : (
        <span className="text-slate-400">—</span>
      ),
      badge: improvement != null ? (
        <span
          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            improvement >= 0
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {improvement >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {improvement >= 0 ? `+${improvement}%` : `${improvement}%`}
        </span>
      ) : null,
      sublabel: hasInterviews ? "Across all competencies" : "Complete a session to assess",
      icon: Target,
      iconBg: "bg-emerald-50 text-emerald-600",
      accentBorder: "group-hover:border-emerald-200",
    },
    {
      id: "readiness",
      label: "Interview Readiness",
      customValue: (
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl truncate max-w-[170px]">
            {readinessLabel}
          </span>
          {readinessScore > 0 && (
            <span className="text-xs font-semibold text-indigo-600">
              (<AnimatedNumber value={readinessScore} suffix="%" />)
            </span>
          )}
        </div>
      ),
      badge: (
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
          <Sparkles className="h-2.5 w-2.5" /> ML Model
        </span>
      ),
      sublabel: hasInterviews ? "Random Forest ML prediction" : "Evaluated upon completion",
      icon: Award,
      iconBg: "bg-violet-50 text-violet-600",
      accentBorder: "group-hover:border-violet-200",
    },
    {
      id: "streak",
      label: "Practice Streak",
      valueComponent: (
        <div className="flex items-baseline gap-1.5">
          <AnimatedNumber value={streakDays} />
          <span className="text-base font-medium text-slate-500">days</span>
        </div>
      ),
      badge: streakDays > 0 ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
          Active
        </span>
      ) : null,
      sublabel: streakDays > 0 ? "Daily consistency active" : "Start today to begin streak",
      icon: Flame,
      iconBg: "bg-amber-50 text-amber-600",
      accentBorder: "group-hover:border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`group card-saas relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 ${item.accentBorder}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-slate-500">
              {item.label}
            </span>
            <div className={`grid h-8 w-8 place-items-center rounded-xl ${item.iconBg}`}>
              <item.icon className="h-4 w-4" strokeWidth={2} />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {item.customValue ? item.customValue : item.valueComponent}
            </div>
            {item.badge}
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {item.sublabel}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
