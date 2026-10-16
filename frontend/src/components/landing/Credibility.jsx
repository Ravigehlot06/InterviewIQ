import {
  ShieldCheck,
  Target,
  RefreshCw,
  Compass,
  CheckCircle2,
} from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Risk-Free Simulation",
    subtitle: "Fail safely before the real interview",
    description:
      "High-stakes interviews should not be your first rehearsal. Practice answers, identify stumbling blocks, and refine explanations in a completely private, low-anxiety environment.",
  },
  {
    icon: Target,
    title: "Role-Specific Rigor",
    subtitle: "Questions that reflect actual hiring bars",
    description:
      "Avoid wasting hours on generic interview trivia. Practice questions calibrated to real hiring rubrics across 22+ engineering, data, product, and business disciplines.",
  },
  {
    icon: Compass,
    title: "STAR Method Calibration",
    subtitle: "Structure your thoughts under pressure",
    description:
      "Develop automatic muscle memory for Situation, Task, Action, and Measurable Result. Learn to answer situational questions with precision instead of rambling.",
  },
  {
    icon: RefreshCw,
    title: "Iterative Muscle Memory",
    subtitle: "Track improvements session by session",
    description:
      "Interviewing is an acquired operational skill. Review your previous sessions, analyze multi-criteria readiness indicators, and approach every interview loop with confidence.",
  },
];

export default function Credibility() {
  return (
    <section className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#49769F]/20 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#001D39] backdrop-blur-md shadow-xs">
            <span>Practical Preparation</span>
            <span className="text-[#0A4174]">·</span>
            <span className="text-[#49769F]">Why Practice Works</span>
          </div>

          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#001D39] sm:text-4xl lg:text-5xl leading-[1.12]">
            Confidence is built through repeated rehearsal.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#49769F] leading-relaxed font-normal">
            The biggest obstacle in high-stakes interviews is rarely a complete lack of knowledge;
            it is formulating concise, structured answers under time constraints without prior rehearsal.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="rounded-[28px] border border-[#49769F]/15 bg-white p-6 sm:p-7 shadow-[0_8px_30px_-6px_rgba(0,29,57,0.03)] flex flex-col justify-between transition-all duration-200 hover:shadow-[0_16px_40px_-8px_rgba(0,29,57,0.08)] hover:border-[#7BBDE8]/40"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BDD8E9]/50 text-[#001D39] border border-[#7BBDE8]/30 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-[#001D39] tracking-tight">
                    {pillar.title}
                  </h3>

                  <p className="mt-1 text-xs font-semibold text-[#0A4174]">
                    {pillar.subtitle}
                  </p>

                  <p className="mt-3 text-xs sm:text-[13px] leading-relaxed text-[#49769F]">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-medium text-[#49769F]/60">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#0A4174]" />
                  <span>Platform Standard</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
