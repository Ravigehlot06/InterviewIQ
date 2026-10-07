import { motion } from "framer-motion";
import { Layers } from "lucide-react";

export default function InterviewBreakdown({ breakdown = [] }) {
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalCount = breakdown.reduce((acc, curr) => acc + (curr.count || 0), 0) || 12;

  // Calculate cumulative offsets for SVG circle segments cleanly
  const segments = breakdown.reduce((acc, item) => {
    const prevOffset = acc.length > 0 ? acc[acc.length - 1].nextPercent : 0;
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((prevOffset / 100) * circumference);
    acc.push({
      ...item,
      strokeDasharray,
      strokeDashoffset,
      nextPercent: prevOffset + item.percentage,
    });
    return acc;
  }, []);

  return (
    <div className="card-saas flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Interview Types
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
            {totalCount} Sessions
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Distribution across mock formats.
        </p>

        {/* Donut Chart & Legend */}
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Animated Donut SVG */}
          <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="#f1f5f9"
                strokeWidth={strokeWidth}
              />

              {/* Segments */}
              {segments.map((seg, idx) => (
                <motion.circle
                  key={seg.type || idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.12 }}
                />
              ))}
            </svg>

            {/* Inner label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-display text-lg font-bold text-slate-900">
                {totalCount}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">
                Total
              </span>
            </div>
          </div>

          {/* Breakdown Legend */}
          <div className="flex w-full flex-col gap-2.5">
            {breakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium text-slate-700">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <Layers className="h-3 w-3 text-slate-400" />
        <span>Balanced mix of Technical and HR maximizes offer rates.</span>
      </div>
    </div>
  );
}
