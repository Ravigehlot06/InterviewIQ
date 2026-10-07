import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

const STATS = [
  { value: 4000, suffix: "+", label: "Roles & real-world interview scenarios" },
  { value: 400000, suffix: "+", label: "AI-powered practice sessions", compact: true },
  { value: 38, suffix: "%", label: "Improvement in interview performance" },
];

function Counter({ value, suffix, compact }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      onUpdate(v) {
        const r = Math.round(v);
        setDisplay(compact ? `${Math.floor(r / 1000)}K` : r.toLocaleString());
      },
    });
    return () => controls.stop();
  }, [inView, value, compact]);
  return <span className="font-display text-4xl text-ink sm:text-5xl">{display}{suffix}</span>;
}

export default function Stats() {
  return (
    <section className="px-6 py-20">
      <div className="card mx-auto grid max-w-5xl gap-10 p-10 sm:grid-cols-3 sm:p-12">
        {STATS.map((s) => (
          <div key={s.label} className="text-center sm:text-left">
            <Counter value={s.value} suffix={s.suffix} compact={s.compact} />
            <p className="mt-2 font-normal text-sm text-ink-soft">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-4 max-w-5xl text-center text-xs text-ink-faint sm:text-left">
        Sample figures shown for product illustration.
      </p>
    </section>
  );
}
