import { motion } from "framer-motion";
import { Sparkles, FileText, MessagesSquare, SlidersHorizontal, LineChart, History } from "lucide-react";
import ProgressRing from "../ui/ProgressRing";

export default function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">Built like a real interview partner</h2>
          <p className="mt-3 font-normal text-ink-soft">Not a chatbot. Not a question bank. A practice system that adapts to you.</p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} className="card-emerald p-8">
            <MessagesSquare className="h-5 w-5 text-white/80" strokeWidth={1.6} />
            <h3 className="mt-4 font-display text-xl">Contextual follow-ups</h3>
            <p className="mt-2 max-w-sm font-normal text-sm leading-relaxed text-white/70">
              The AI probes deeper into what you actually said, instead of moving down a fixed script.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ delay: 0.05 }} className="card flex items-center gap-6 p-8">
            <ProgressRing value={78} size={90} strokeWidth={8} label="Score" />
            <div>
              <LineChart className="h-5 w-5 text-emerald" strokeWidth={1.6} />
              <h3 className="mt-3 font-display text-xl text-ink">Detailed reports</h3>
              <p className="mt-1.5 font-normal text-sm leading-relaxed text-ink-soft">Concrete scores and feedback after every session.</p>
            </div>
          </motion.div>

          {[
            { icon: Sparkles, title: "AI-powered interviews", copy: "Every question is generated live, not from a static bank." },
            { icon: FileText, title: "Resume-aware questions", copy: "Questions grounded in your real projects and skills." },
            { icon: SlidersHorizontal, title: "Adaptive difficulty", copy: "Easy, medium, or hard — tuned to your experience." },
            { icon: History, title: "History & progress", copy: "Track every session and watch readiness change." },
          ].map((f, idx) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ delay: idx * 0.05 }} className="card-soft p-6">
              <f.icon className="h-5 w-5 text-orange" strokeWidth={1.6} />
              <h3 className="mt-3 font-display text-[16px] text-ink">{f.title}</h3>
              <p className="mt-1.5 font-normal text-[13px] leading-relaxed text-ink-soft">{f.copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
