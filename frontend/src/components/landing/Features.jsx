import { motion } from "framer-motion";
import {
  Code2,
  GitBranch,
  FileCheck2,
  LineChart,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Cpu,
} from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#49769F]/20 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#001D39] backdrop-blur-md shadow-xs">
            <span>Core Capabilities</span>
            <span className="text-[#0A4174]">·</span>
            <span className="text-[#49769F]">Platform Architecture</span>
          </div>

          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#001D39] sm:text-4xl lg:text-5xl leading-[1.12]">
            Built for the way interviews actually work.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#49769F] leading-relaxed font-normal">
            Legacy prep relies on static flashcards and scripted question banks. InterviewIQ
            conducts dynamic, conversational simulations that calibrate to your real responses.
          </p>
        </div>

        {/* ── 4 EDITORIAL FEATURE MODULES ── */}
        <div className="mt-14 sm:mt-20 space-y-8 sm:space-y-12">
          {/* FEATURE 01: Role-Specific Practice (Large Asymmetric Layout) */}
          <div className="rounded-[32px] border border-[#49769F]/15 bg-white p-6 sm:p-10 lg:p-12 shadow-[0_16px_40px_-12px_rgba(0,29,57,0.05)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#BDD8E9]/50 px-3 py-1 text-xs font-bold text-[#0A4174] border border-[#7BBDE8]/40">
                  <Code2 className="h-3.5 w-3.5" />
                  <span>Module 01 · Role Calibration</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#001D39] tracking-tight">
                  Role-specific practice, grounded in real hiring bars.
                </h3>

                <p className="text-sm sm:text-base leading-relaxed text-[#49769F]">
                  A Junior Frontend Developer faces fundamentally different challenges than a Senior
                  Distributed Systems Engineer. InterviewIQ calibrates question scope, algorithmic
                  depth, and architectural trade-offs to the exact role you're interviewing for.
                </p>

                <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="font-bold text-[#001D39] block mb-0.5">22+ Roles Supported</span>
                    <span className="text-[#49769F]">From Full Stack to Data & AI</span>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="font-bold text-[#001D39] block mb-0.5">Seniority Levels</span>
                    <span className="text-[#49769F]">Fresher, Mid-Level, and Senior</span>
                  </div>
                </div>
              </div>

              {/* Right Interface Mockup */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                    <span className="text-xs font-bold text-[#001D39]">Domain Rubric Blueprint</span>
                    <span className="rounded bg-white px-2 py-0.5 text-[10px] font-mono font-bold text-[#0A4174] border border-slate-200">
                      Standardized Evaluation
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { area: "Architecture & System Design", weight: "35%", status: "Evaluated" },
                      { area: "Algorithmic Precision & Complexity", weight: "25%", status: "Evaluated" },
                      { area: "Error Handling & Concurrency", weight: "20%", status: "Evaluated" },
                      { area: "Trade-off Justification", weight: "20%", status: "Evaluated" },
                    ].map((item) => (
                      <div
                        key={item.area}
                        className="flex items-center justify-between rounded-xl bg-white border border-slate-200/70 p-3 text-xs"
                      >
                        <span className="font-semibold text-[#001D39]">{item.area}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#49769F] font-mono text-[11px]">Weight {item.weight}</span>
                          <CheckCircle2 className="h-4 w-4 text-[#0A4174]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE 02: Adaptive Follow-Up Questions (Alternating Layout) */}
          <div className="rounded-[32px] border border-[#49769F]/15 bg-white p-6 sm:p-10 lg:p-12 shadow-[0_16px_40px_-12px_rgba(0,29,57,0.05)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Interface Mockup */}
              <div className="lg:col-span-6 order-2 lg:order-1">
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-bold text-[#001D39]">Adaptive Dialogue Flow</span>
                    <span className="text-[10px] font-bold text-[#0A4174] bg-[#BDD8E9]/40 px-2 py-0.5 rounded border border-[#7BBDE8]/30">
                      Context Probing
                    </span>
                  </div>

                  {/* Initial Question */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                    <span className="text-[10px] font-bold text-[#49769F] uppercase">Primary Question</span>
                    <p className="mt-1 font-bold text-[#001D39]">
                      "How do you handle schema migrations with zero downtime in high-traffic Postgres databases?"
                    </p>
                  </div>

                  {/* Connector arrow */}
                  <div className="flex justify-center text-[#7BBDE8]">
                    <GitBranch className="h-5 w-5" />
                  </div>

                  {/* Adaptive Probing Follow-up */}
                  <div className="rounded-xl border border-[#7BBDE8]/40 bg-[#BDD8E9]/25 p-3 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-[#0A4174] mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#7BBDE8]" />
                      <span>Adaptive Probe Derived from Candidate Answer</span>
                    </div>
                    <p className="text-[#49769F] leading-relaxed text-[11.5px]">
                      "You mentioned adding a shadow column. How would you backfill existing historical rows without locking the table and starving write queries?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Text */}
              <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#BDD8E9]/50 px-3 py-1 text-xs font-bold text-[#0A4174] border border-[#7BBDE8]/40">
                  <GitBranch className="h-3.5 w-3.5" />
                  <span>Module 02 · Dynamic Probing</span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#001D39] tracking-tight">
                  Adaptive follow-ups that test real comprehension.
                </h3>

                <p className="text-sm sm:text-base leading-relaxed text-[#49769F]">
                  Real interviewers don't merely check off a rubric; they listen to what you say and
                  test whether you truly comprehend the edge cases. InterviewIQ listens to your exact
                  STAR response, catches vague generalizations, and immediately probes deeper.
                </p>

                <ul className="space-y-2 text-xs sm:text-sm text-[#49769F]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#0A4174] flex-shrink-0" />
                    <span>No pre-recorded static video prompts or generic chatbots</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#0A4174] flex-shrink-0" />
                    <span>Evaluates logic consistency across primary answers and follow-ups</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#0A4174] flex-shrink-0" />
                    <span>Identifies gaps before your real interviewer does</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* DUAL EDITORIAL CARDS: Module 03 & 04 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* FEATURE 03: Resume-Aware Personalization */}
            <div className="rounded-[32px] border border-[#49769F]/15 bg-white p-6 sm:p-9 shadow-[0_16px_40px_-12px_rgba(0,29,57,0.05)] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#BDD8E9]/50 px-3 py-1 text-xs font-bold text-[#0A4174] border border-[#7BBDE8]/40">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>Module 03 · Resume Context</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#001D39] tracking-tight">
                  Resume-aware questions grounded in your actual work.
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed text-[#49769F]">
                  Upload your PDF or DOCX resume to let the system extract verified project claims,
                  tech stack combinations, and previous responsibilities. Prepare to defend the exact
                  bullet points on your CV.
                </p>
              </div>

              {/* Resume Card Preview */}
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between text-xs font-bold text-[#001D39] mb-2">
                  <span>Parsed Candidate Profile</span>
                  <span className="text-[10px] text-[#0A4174] bg-[#BDD8E9]/40 px-2 py-0.5 rounded border border-[#7BBDE8]/30">
                    Active
                  </span>
                </div>
                <div className="text-[11px] text-[#49769F] leading-normal mb-3">
                  "Led redesign of customer portal with Next.js, reducing TTI by 42% and implementing GraphQL subscriptions."
                </div>
                <div className="rounded-lg bg-white border border-slate-200 p-2.5 text-[11px] font-medium text-[#001D39]">
                  <span className="font-bold text-[#0A4174]">Derived AI Question: </span>
                  "What architectural challenges did you face when maintaining WebSocket connection stability for GraphQL subscriptions?"
                </div>
              </div>
            </div>

            {/* FEATURE 04: Multi-Criteria Performance Insights */}
            <div className="rounded-[32px] border border-[#49769F]/15 bg-white p-6 sm:p-9 shadow-[0_16px_40px_-12px_rgba(0,29,57,0.05)] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#BDD8E9]/50 px-3 py-1 text-xs font-bold text-[#0A4174] border border-[#7BBDE8]/40">
                  <LineChart className="h-3.5 w-3.5" />
                  <span>Module 04 · Performance Insights</span>
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#001D39] tracking-tight">
                  Multi-criteria scoring with ML readiness indicators.
                </h3>

                <p className="text-xs sm:text-sm leading-relaxed text-[#49769F]">
                  Understand your responses through objective criteria. Every mock session evaluates
                  factual technical accuracy, STAR communication structure, and problem-solving logic
                  to generate a calibrated readiness estimate.
                </p>
              </div>

              {/* Score Card Preview */}
              <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#001D39]">Readiness Indicator</span>
                  <span className="font-display text-base font-extrabold text-[#0A4174]">84% / 100%</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-[#49769F]">
                    <span>Technical Rigor</span>
                    <span className="font-bold text-[#001D39]">88%</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#49769F]">
                    <span>STAR Delivery</span>
                    <span className="font-bold text-[#001D39]">82%</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#49769F]">
                    <span>Clarity & Conciseness</span>
                    <span className="font-bold text-[#001D39]">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
