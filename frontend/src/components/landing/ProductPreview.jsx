import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mic,
  MicOff,
  Video,
  Volume2,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Send,
  Loader2,
  User,
} from "lucide-react";

export default function ProductPreview() {
  const [activeTab, setActiveTab] = useState("question");

  return (
    <section id="preview" className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#49769F]/20 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#001D39] backdrop-blur-md shadow-xs">
            <span>Product Preview</span>
            <span className="text-[#0A4174]">·</span>
            <span className="text-[#49769F]">Interface Architecture</span>
          </div>

          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#001D39] sm:text-4xl lg:text-5xl leading-[1.12]">
            Realistic simulations. Zero artificial gimmicks.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#49769F] leading-relaxed font-normal">
            Experience the calm, focused interface where technical and behavioral interview
            responses are structured, tested, and evaluated before the real thing.
          </p>
        </div>

        {/* ── LARGE REALISTIC PRODUCT INTERFACE CANVAS ── */}
        <div className="mt-14 sm:mt-18 relative">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-1 rounded-[36px] bg-gradient-to-b from-[#7BBDE8]/15 to-transparent blur-2xl -z-10" />

          <div className="overflow-hidden rounded-[28px] sm:rounded-[36px] border border-[#49769F]/15 bg-white shadow-[0_25px_65px_-18px_rgba(0,29,57,0.07)]">
            {/* Top Chrome / Window Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/80 px-4 sm:px-6 py-3.5">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-slate-300" />
                  <span className="h-3 w-3 rounded-full bg-slate-300" />
                  <span className="h-3 w-3 rounded-full bg-slate-300" />
                </div>
                <div className="h-4 w-px bg-slate-200" />
                <span className="font-display text-xs sm:text-sm font-bold text-[#001D39]">
                  InterviewIQ Practice Suite — Active Technical Session
                </span>
              </div>

              {/* Session Progress Tracker */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-[#0A4174]" style={{ width: "66%" }} />
                  </div>
                  <span className="text-[11px] font-bold text-[#49769F]">Q4 of 6 · 66%</span>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-[#001D39]">
                  <Clock className="h-3 w-3 text-[#49769F]" />
                  <span>06:42</span>
                </div>
              </div>
            </div>

            {/* Main Inside Room 2-Column Split */}
            <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 bg-[#f8fafc]/60">
              {/* Left Column (7 cols): AI Studio Avatar Viewport */}
              <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden rounded-2xl bg-[#080C19] p-4 sm:p-5 text-white relative min-h-[340px] sm:min-h-[420px] border border-slate-800">
                {/* AI Interviewer Video Frame */}
                <div className="absolute inset-0 overflow-hidden opacity-30">
                  <img
                    src="/interviewer.jpg"
                    alt="AI Interviewer Visual"
                    className="h-full w-full object-cover object-center filter grayscale contrast-125"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080C19] via-[#080C19]/60 to-transparent" />
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-md border border-white/10">
                    <span className="h-2 w-2 rounded-full bg-[#7BBDE8] animate-pulse" />
                    AI Interviewer · Active Speech
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300">
                    STAR Model: Probing Depth
                  </span>
                </div>

                {/* Corner User PiP */}
                <div className="absolute bottom-4 right-4 z-20 h-24 w-32 sm:h-28 sm:w-36 rounded-xl border border-white/20 bg-slate-900/90 shadow-2xl overflow-hidden backdrop-blur-md">
                  <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-slate-300 mb-1">
                      <User className="h-3.5 w-3.5 text-slate-300" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-300">You (Candidate)</span>
                    <span className="text-[9px] text-[#7BBDE8] font-mono">Camera & Mic On</span>
                  </div>
                </div>

                {/* Bottom Room Controls Bar */}
                <div className="relative z-10 flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 backdrop-blur-md border border-white/10 text-xs">
                    <Mic className="h-3.5 w-3.5 text-[#7BBDE8]" />
                    <span className="text-white text-[11px] font-medium">Mic Active</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 backdrop-blur-md border border-white/10 text-xs">
                    <Video className="h-3.5 w-3.5 text-[#7BBDE8]" />
                    <span className="text-white text-[11px] font-medium">Video On</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 backdrop-blur-md border border-white/10 text-xs">
                    <Volume2 className="h-3.5 w-3.5 text-slate-300" />
                    <span className="text-slate-300 text-[11px] font-medium">80%</span>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Active Question & Response Interface */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                <div>
                  {/* Question Header & Type */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-[11px] font-bold text-[#49769F] uppercase tracking-wider">
                      Question 4 of 6
                    </span>
                    <span className="rounded-md bg-[#BDD8E9]/40 px-2 py-0.5 text-[10px] font-bold text-[#0A4174] border border-[#7BBDE8]/30">
                      Technical Deep Dive
                    </span>
                  </div>

                  {/* Question Body */}
                  <div className="mt-3">
                    <h3 className="font-display text-sm sm:text-[15px] font-bold text-[#001D39] leading-snug">
                      "Can you explain how optimistic concurrency control differs from pessimistic
                      locking in high-throughput transactions, and when you would select each?"
                    </h3>
                  </div>

                  {/* Candidate Real Response Textarea Mock */}
                  <div className="mt-3.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#49769F] mb-1">
                      <span>Candidate Response</span>
                      <span className="text-[#0A4174] font-mono">Speech-to-Text synced</span>
                    </div>
                    <p className="text-xs text-[#49769F] leading-relaxed">
                      "Optimistic concurrency control checks a version token or timestamp at commit time without
                      holding locks during read operations, which optimizes for low-conflict throughput.
                      Pessimistic locking explicitly locks rows via SELECT FOR UPDATE, ideal for high-contention
                      balances where rollback overhead exceeds lock cost..."
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-[#49769F]/60">
                      <span>312 characters</span>
                      <span>Press Ctrl + Enter to submit</span>
                    </div>
                  </div>

                  {/* Adaptive Follow-up Prompt Chip */}
                  <div className="mt-3 rounded-xl border border-[#7BBDE8]/40 bg-[#BDD8E9]/25 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A4174] mb-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-[#7BBDE8]" />
                      <span>Contextual Probing Follow-Up</span>
                    </div>
                    <p className="text-[11px] text-[#49769F] leading-normal">
                      "What happens in optimistic locking if 100 concurrent workers attempt to update the same record simultaneously?"
                    </p>
                  </div>
                </div>

                {/* Action CTA within Mock */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#49769F]">
                    <span>Evaluation: </span>
                    <strong className="text-[#0A4174]">89% Technical Accuracy</strong>
                  </div>

                  <Link
                    to="/interview/setup"
                    className="inline-flex items-center gap-1 rounded-full bg-[#001D39] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#0A4174] transition-colors"
                  >
                    <span>Try It Live</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Understated Illustrative Caption */}
          <p className="mt-4 text-center text-xs text-[#49769F]/60">
            * Illustrative interface mockup representing InterviewIQ's live mock interview workspace.
          </p>
        </div>
      </div>
    </section>
  );
}
