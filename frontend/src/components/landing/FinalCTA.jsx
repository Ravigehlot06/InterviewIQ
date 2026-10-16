import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40 overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-t from-blue-200/40 via-sky-100/20 to-transparent blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[36px] sm:rounded-[44px] border border-slate-900/[0.08] bg-[#050419] p-8 sm:p-14 lg:p-20 text-center text-white shadow-2xl">
          {/* Subtle Ambient Radial Inside the Card */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/35 via-[#050419] to-[#050419]" />

          {/* Top Label */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-300 backdrop-blur-md mb-6">
            <Sparkles className="h-3 w-3 text-[#0F32DC]" />
            <span>Ready When You Are</span>
          </div>

          {/* Oversized Headline */}
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl leading-[1.12]">
            Your next opportunity deserves preparation.
          </h2>

          {/* Supporting Text */}
          <p className="mx-auto mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300 font-normal">
            Start practicing today. Build familiarity with the questions, strengthen your responses,
            and approach your next interview with greater confidence.
          </p>

          {/* Action Button */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/interview/setup"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#050419] shadow-lg shadow-white/10 transition-all duration-200 hover:bg-slate-100 active:scale-98"
            >
              <span>Start Interview</span>
              <ArrowUpRight className="h-4 w-4 text-slate-700 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.05] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/10 hover:border-white/30 active:scale-98"
            >
              <span>Create Free Account</span>
            </Link>
          </div>

          {/* Guarantee / Benefit note */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Free instant practice session
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No credit card required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Private & risk-free simulation
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
