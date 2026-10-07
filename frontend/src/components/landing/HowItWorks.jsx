import { useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  { n: "01", title: "Choose your role", copy: "Pick the role you're preparing for and, optionally, a target company." },
  { n: "02", title: "Personalize your interview", copy: "Add your resume, set experience level, difficulty, and interview type." },
  { n: "03", title: "Face the AI interview", copy: "The AI asks a question, listens, and follows up on what you actually said." },
  { n: "04", title: "Understand your performance", copy: "Get a structured report with a clear readiness estimate." },
];

function StepPreview({ index }) {
  if (index === 2) {
    return (
      <div className="flex w-full flex-col gap-3">
        <div className="card-soft px-4 py-3 text-[13px]">
          <span className="text-[11px] text-ink-faint">Your answer</span>
          <p className="mt-1 text-ink">"I built a data pipeline with pandas."</p>
        </div>
        <div className="ml-4 h-5 w-px bg-line" />
        <div className="card-soft px-4 py-3 text-[13px]">
          <span className="text-[11px] font-semibold text-emerald">AI understands context</span>
        </div>
        <div className="ml-4 h-5 w-px bg-line" />
        <div className="card-emerald px-4 py-3 text-[13px]">
          <span className="text-[11px] text-white/60">Follow-up question</span>
          <p className="mt-1">"How did you handle missing values?"</p>
        </div>
      </div>
    );
  }
  return <div className="card-soft flex h-full min-h-32 w-full items-center justify-center text-sm text-ink-faint">Preview</div>;
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  return (
    <section id="how-it-works" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">How InterviewIQ works</h2>
          <p className="mt-3 font-normal text-ink-soft">From choosing your role to understanding your performance.</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-2">
            {STEPS.map((step, idx) => (
              <button
                key={step.n}
                onClick={() => setActive(idx)}
                className={`rounded-3xl px-6 py-5 text-left transition-all ${active === idx ? "card" : ""}`}
              >
                <span className={`text-xs font-bold ${active === idx ? "text-emerald" : "text-ink-faint"}`}>{step.n}</span>
                <h3 className={`mt-1 font-display text-lg ${active === idx ? "text-ink" : "text-ink-faint"}`}>{step.title}</h3>
                {active === idx && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 font-normal text-sm text-ink-soft">
                    {step.copy}
                  </motion.p>
                )}
              </button>
            ))}
          </div>

          <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card hidden items-center p-9 lg:flex">
            <StepPreview index={active} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
