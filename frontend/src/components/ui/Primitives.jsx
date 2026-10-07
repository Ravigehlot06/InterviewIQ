export function Badge({ children, tone = "neutral", className = "" }) {
  const tones = {
    neutral: "bg-panel text-ink-soft",
    demo: "bg-cream text-amber-ink",
    live: "bg-emerald-soft text-emerald-deep",
    accent: "bg-emerald-soft text-emerald",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone] || tones.neutral} ${className}`}>
      {children}
    </span>
  );
}

export function Spinner({ className = "", room = false }) {
  return (
    <span
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 ${
        room ? "border-white/20 border-t-white" : "border-line border-t-emerald"
      } ${className}`}
      aria-label="Loading"
      role="status"
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      {Icon && <Icon className="h-7 w-7 text-ink-faint" strokeWidth={1.5} />}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="max-w-sm text-sm font-normal text-ink-soft">{description}</p>}
      {action}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
      {children}
    </span>
  );
}
