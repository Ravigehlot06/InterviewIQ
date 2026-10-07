import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

/**
 * Builds a smooth SVG cubic bezier path from a list of coordinates
 */
function buildSmoothPath(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

const METRIC_TABS = [
  { key: "overall", label: "Overall", color: "#6366f1" },
  { key: "technical", label: "Technical", color: "#8b5cf6" },
  { key: "communication", label: "Communication", color: "#3b82f6" },
  { key: "problem_solving", label: "Problem Solving", color: "#06b6d4" },
  { key: "confidence", label: "Confidence", color: "#10b981" },
];

export default function PerformanceChart({ data = [] }) {
  const [activeMetric, setActiveMetric] = useState("overall");
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeConfig = METRIC_TABS.find((t) => t.key === activeMetric) || METRIC_TABS[0];

  // Chart dimensions inside SVG viewBox
  const width = 640;
  const height = 240;
  const padLeft = 44;
  const padRight = 36;
  const padTop = 30;
  const padBottom = 40;

  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const minScore = 40;
  const maxScore = 100;

  // Map data to SVG coordinates
  const points = data.map((d, index) => {
    const val = Number(d[activeMetric]) || Number(d.overall) || 60;
    const x = padLeft + (index / Math.max(1, data.length - 1)) * chartWidth;
    const y = padTop + chartHeight - ((val - minScore) / (maxScore - minScore)) * chartHeight;
    return { ...d, value: val, x, y, index };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`
    : "";

  const latestVal = points.length > 0 ? points[points.length - 1].value : 0;
  const firstVal = points.length > 0 ? points[0].value : 0;
  const delta = latestVal - firstVal;

  return (
    <div className="card-saas relative flex flex-col justify-between p-6">
      {/* Top Header & Metric Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Performance Overview
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" />
              {delta >= 0 ? `+${delta}%` : `${delta}%`} Growth
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Track how your interview performance is improving over time.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100/80 p-1">
          {METRIC_TABS.map((tab) => {
            const isActive = activeMetric === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveMetric(tab.key);
                  setHoveredPoint(null);
                }}
                className={`relative rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Line Graph Container */}
      <div className="relative mt-6 w-full select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full overflow-visible"
        >
          <defs>
            <linearGradient id={`chart-grad-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeConfig.color} stopOpacity="0.28" />
              <stop offset="90%" stopColor={activeConfig.color} stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id={`stroke-grad-${activeMetric}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="60%" stopColor={activeConfig.color} />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor={activeConfig.color} floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[40, 60, 80, 100].map((score) => {
            const y = padTop + chartHeight - ((score - minScore) / (maxScore - minScore)) * chartHeight;
            return (
              <g key={score}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 10}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                  fontWeight="500"
                >
                  {score}%
                </text>
              </g>
            );
          })}

          {/* Gradient Filled Area Under Curve */}
          <motion.path
            d={areaPath}
            fill={`url(#chart-grad-${activeMetric})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />

          {/* Animated Line Drawing from Left to Right */}
          <motion.path
            key={activeMetric}
            d={linePath}
            fill="none"
            stroke={`url(#stroke-grad-${activeMetric})`}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#softGlow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Interactive Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.index === idx;
            const isLast = idx === points.length - 1;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer"
              >
                {/* Hit area */}
                <circle cx={pt.x} cy={pt.y} r={14} fill="transparent" />

                {/* Animated pulsing outer radar ring for final score */}
                {isLast && !isHovered && (
                  <motion.circle
                    cx={pt.x}
                    cy={pt.y}
                    r={9}
                    fill="none"
                    stroke={activeConfig.color}
                    strokeWidth="1.5"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  />
                )}

                {/* Point dot with progressive scale-in */}
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : isLast ? 5 : 4}
                  fill="#ffffff"
                  stroke={activeConfig.color}
                  strokeWidth={isHovered ? 3.5 : 2.5}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1, duration: 0.3 }}
                />

                {/* Date Label on X-axis */}
                <text
                  x={pt.x}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                  fontWeight="600"
                >
                  {pt.date}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 6 }}
              transition={{ duration: 0.15 }}
              style={{
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100}%`,
              }}
              className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full pb-3"
            >
              <div className="rounded-xl border border-slate-200/80 bg-slate-900 px-3 py-2 text-xs text-white shadow-xl">
                <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                  <span>{hoveredPoint.date}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-indigo-300">{hoveredPoint.role || "Session"}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-base font-bold text-white">
                    {hoveredPoint.value}%
                  </span>
                  <span className="capitalize text-slate-400">
                    {activeConfig.label}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Scores reflect AI multi-criteria evaluation (Technical, Communication & Logic).</span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          <span className="text-slate-700">Latest score: <strong className="text-indigo-600">{latestVal}%</strong></span>
        </div>
      </div>
    </div>
  );
}
