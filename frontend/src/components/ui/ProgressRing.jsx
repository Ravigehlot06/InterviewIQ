import { motion } from "framer-motion";

/** Animated progress ring in the emerald/amber gradient, with a soft glossy
 * drop-shadow to echo the reference's glossy card lighting. */
export default function ProgressRing({ value = 0, size = 140, strokeWidth = 12, label, sublabel, dark = false }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const gradientId = `progress-gradient-${size}-${dark ? "d" : "l"}`;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" style={{ filter: "drop-shadow(0 8px 14px rgba(15,122,87,0.28))" }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f7a57" />
            <stop offset="100%" stopColor="#f2a03d" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={dark ? "rgba(255,255,255,0.12)" : "#e6e3de"}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - clamped / 100) }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-display text-3xl font-extrabold ${dark ? "text-white" : "text-ink"}`}>{Math.round(clamped)}</span>
        {label && <span className={`text-[11px] font-medium ${dark ? "text-white/70" : "text-ink-soft"}`}>{label}</span>}
        {sublabel && <span className={`mt-0.5 text-[10px] ${dark ? "text-white/50" : "text-ink-faint"}`}>{sublabel}</span>}
      </div>
    </div>
  );
}
