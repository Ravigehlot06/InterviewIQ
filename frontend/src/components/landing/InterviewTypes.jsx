import { motion } from "framer-motion";
import { Users, Cpu, Briefcase, Building2 } from "lucide-react";

const TYPES = [
  { icon: Users, title: "HR Interview", copy: "Behavioral and culture-fit questions.", style: "card-soft" },
  { icon: Cpu, title: "Technical Interview", copy: "Data structures, system design, tools.", style: "card-amber" },
  { icon: Briefcase, title: "Role-Based Interview", copy: "Tailored to your exact responsibilities.", style: "card-soft" },
  { icon: Building2, title: "Target-Company Practice", copy: "Simulated practice, not official material.", style: "card-emerald" },
];

export default function InterviewTypes() {
  return (
    <section id="interview-types" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Practice the interview you'll face</h2>
          <p className="mt-3 font-normal text-ink-soft">Four formats, each built around how real interviewers operate.</p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {TYPES.map((t, idx) => {
            const dark = t.style === "card-emerald";
            const onAmber = t.style === "card-amber";
            return (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ delay: idx * 0.05 }}
                className={`${t.style} p-7`}
              >
                <t.icon className={`h-6 w-6 ${dark ? "text-white/80" : onAmber ? "text-amber-ink" : "text-emerald"}`} strokeWidth={1.5} />
                <h3 className={`mt-4 font-display text-lg ${dark ? "text-white" : "text-ink"}`}>{t.title}</h3>
                <p className={`mt-1.5 font-normal text-sm ${dark ? "text-white/65" : onAmber ? "text-ink/70" : "text-ink-soft"}`}>{t.copy}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
