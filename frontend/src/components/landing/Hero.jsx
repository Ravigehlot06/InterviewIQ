import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, FileText, ArrowUpRight } from "lucide-react";
import ProgressRing from "../ui/ProgressRing";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  return (
    <section className="px-4 pb-24 pt-10 sm:px-6">
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-4 sm:grid-rows-[auto_auto]"
      >
        {/* Large headline card */}
        <motion.div variants={fadeUp} className="card flex flex-col justify-between p-9 sm:col-span-2 sm:row-span-2">
          <div>
            <h1 className="font-display text-[2.3rem] leading-[1.12] text-ink sm:text-[2.6rem]">
              Practice interviews.
              <br />
              Build confidence.
              <br />
              Get interview-ready.
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
              InterviewIQ conducts adaptive AI mock interviews personalized to your role,
              resume, experience, and target company.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button to="/signup">Start your interview</Button>
            <a href="#how-it-works" className="text-[14px] font-semibold text-ink-soft hover:text-ink">
              See how it works
            </a>
          </div>
        </motion.div>

        {/* Amber card: live question preview */}
        <motion.div variants={fadeUp} className="card-amber flex flex-col justify-between p-6 sm:col-span-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-ink/80">AI Interviewer</span>
            <p className="mt-2 font-display text-lg leading-snug text-ink">
              "How did you handle missing values in that dataset?"
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-amber-ink/80">
            <Sparkles className="h-3.5 w-3.5" />
            Follow-up from your last answer
          </div>
        </motion.div>

        {/* Small white card: resume aware */}
        <motion.div variants={fadeUp} className="card-soft flex flex-col justify-center gap-2 p-6">
          <FileText className="h-5 w-5 text-emerald" strokeWidth={1.8} />
          <p className="font-display text-[15px] text-ink">Resume-aware</p>
          <p className="text-[12px] text-ink-soft">Questions grounded in your real projects.</p>
        </motion.div>

        {/* Emerald feature card: readiness ring */}
        <motion.div variants={fadeUp} className="card-emerald flex items-center justify-between p-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-white/60">Readiness estimate</span>
            <p className="mt-2 font-display text-lg leading-snug">Almost ready</p>
            <p className="mt-1 flex items-center gap-1 text-[12px] text-white/60">
              <ArrowUpRight className="h-3.5 w-3.5" /> +8% from last practice
            </p>
          </div>
          <ProgressRing value={82} size={84} strokeWidth={8} dark />
        </motion.div>
      </motion.div>
    </section>
  );
}

function Button({ to, children }) {
  return (
    <Link
      to={to}
      className="rounded-full bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_30px_-14px_rgba(6,78,59,0.65)] transition-transform hover:scale-[1.03]"
    >
      {children}
    </Link>
  );
}
