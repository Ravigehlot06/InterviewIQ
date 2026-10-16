import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code,
  Brain,
  Smartphone,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Mic,
  Award,
  ChevronDown,
} from "lucide-react";

const STAGES = [
  {
    id: "01",
    label: "01",
    stepName: "Target your discipline",
    headline: "Calibrate to your exact career discipline.",
    description:
      "Select from 22+ professional tracks across Software Engineering, System Architecture, Data Science, and Mobile. Each role activates domain-specific evaluation criteria calibrated to real-world tier-1 hiring standards.",
    badge: "Stage 01 · Discipline Calibration",
  },
  {
    id: "02",
    label: "02",
    stepName: "Personalize your interview",
    headline: "Make every question relevant.",
    description:
      "Choose an optional target company and upload your resume when supported. InterviewIQ uses available role, company, and resume context to tailor the interview experience.",
    badge: "Stage 02 · Customization",
  },
  {
    id: "03",
    label: "03",
    stepName: "Face the AI interview",
    headline: "Practice in a realistic setting.",
    description:
      "Answer interview questions and encounter relevant follow-up questions based on the conversation and available context. The AI probes into trade-offs and edge cases just like a senior interviewer.",
    badge: "Stage 03 · Live Simulation",
  },
  {
    id: "04",
    label: "04",
    stepName: "Understand your performance",
    headline: "Turn every attempt into insight.",
    description:
      "Review your answers, performance indicators, and available readiness insights to identify areas for improvement. Receive a multi-criteria breakdown across Technical, Communication, and Problem Solving.",
    badge: "Stage 04 · Performance & ML Readiness",
  },
];

export default function ScrollStory() {
  const [activeStage, setActiveStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);

  // Jump smoothly to a specific stage when clicked
  const scrollToStage = (stageIdx) => {
    if (!sectionRef.current) return;
    const totalScrollableDistance = sectionRef.current.offsetHeight - window.innerHeight;
    const targetScroll = sectionRef.current.offsetTop + (stageIdx / STAGES.length) * totalScrollableDistance + 10;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  // Scroll-driven step progression
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const totalScrollableDistance = sectionRef.current.offsetHeight - window.innerHeight;

      if (totalScrollableDistance <= 0) return;

      // Distance scrolled within the section
      const scrolledIntoSection = -rect.top;
      const rawProgress = scrolledIntoSection / totalScrollableDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));
      setScrollProgress(progress);

      // Map progress [0, 1] to 4 stages [0, 1, 2, 3]
      const stageIndex = Math.min(
        STAGES.length - 1,
        Math.floor(progress * STAGES.length)
      );
      setActiveStage(stageIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const current = STAGES[activeStage];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative h-[320vh] w-full"
    >
      {/* Sticky Viewport Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden py-10 lg:py-16">
        {/* Subtle Ambient Glow Orbs */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[#7BBDE8]/15 blur-[120px] animate-orb-1" />
          <div className="absolute bottom-10 right-10 h-[450px] w-[450px] rounded-full bg-[#4E8EA2]/15 blur-[130px] animate-orb-2" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          {/* Section Heading & Subtitle */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#49769F]/20 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#001D39] backdrop-blur-md shadow-xs">
                <span>Numbered Process</span>
                <span className="text-[#0A4174]">·</span>
                <span className="text-[#49769F]">Scroll-Driven</span>
              </div>

              <h2 className="mt-3 font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#001D39] leading-[1.15]">
                From preparation to interview confidence.
              </h2>
            </div>

            {/* Scroll Indicator helper */}
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#BDD8E9]/40 border border-[#7BBDE8]/40 px-3 py-1.5 text-xs font-semibold text-[#0A4174]">
              <span>Scroll to navigate steps</span>
              <ChevronDown className="h-3.5 w-3.5 animate-bounce text-[#0A4174]" />
            </div>
          </div>

          {/* Continuous Process Step Milestones (Scrollable and Clickable) */}
          <div className="mt-8 sm:mt-10 relative">
            {/* Hairline background track */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[3px] bg-slate-200/80 -z-10 rounded-full overflow-hidden">
              {/* Dynamic filled progress track */}
              <div
                className="h-full bg-gradient-to-r from-[#001D39] via-[#0A4174] to-[#7BBDE8] transition-all duration-150"
                style={{ width: `${Math.round(scrollProgress * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 select-none">
              {STAGES.map((s, idx) => {
                const isActive = activeStage === idx;
                const isPast = activeStage > idx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => scrollToStage(idx)}
                    className={`relative flex flex-col items-start rounded-2xl border p-3.5 sm:p-4 text-left transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "border-[#0A4174] bg-white shadow-lg shadow-[#0A4174]/10 ring-2 ring-[#7BBDE8]/60 scale-[1.02]"
                        : isPast
                        ? "border-[#49769F]/30 bg-white/90 shadow-xs"
                        : "border-slate-200/80 bg-white/60 opacity-60"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between mb-1.5">
                      <span
                        className={`font-mono text-xs font-black tracking-wider transition-colors ${
                          isActive
                            ? "text-[#0A4174]"
                            : isPast
                            ? "text-[#49769F]"
                            : "text-slate-400"
                        }`}
                      >
                        {s.label}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                          isActive
                            ? "bg-[#0A4174] ring-4 ring-[#7BBDE8]/40 scale-125"
                            : isPast
                            ? "bg-[#4E8EA2]"
                            : "bg-slate-300"
                        }`}
                      />
                    </div>

                    <span
                      className={`font-display text-xs sm:text-[13px] font-bold transition-colors line-clamp-1 ${
                        isActive
                          ? "text-[#001D39]"
                          : isPast
                          ? "text-[#0A4174]"
                          : "text-slate-500"
                      }`}
                    >
                      {s.stepName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── STAGE CONTENT & VISUAL SPLIT DISPLAY ── */}
          <div className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            {/* Left Column (5 cols): Story Text & Details */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#BDD8E9]/50 px-3 py-1 text-xs font-bold text-[#001D39] border border-[#7BBDE8]/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0A4174]" />
                    <span>{current.badge}</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#001D39] leading-tight">
                    {current.headline}
                  </h3>

                  <p className="text-sm sm:text-base leading-relaxed text-[#49769F] font-normal">
                    {current.description}
                  </p>

                  {/* Progress Indicator */}
                  <div className="pt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2.5 text-xs font-semibold text-[#0A4174]">
                      <span>Stage {activeStage + 1} of 4</span>
                      <div className="flex gap-1.5">
                        {STAGES.map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === activeStage
                                ? "w-7 bg-[#0A4174]"
                                : i < activeStage
                                ? "w-3 bg-[#4E8EA2]"
                                : "w-1.5 bg-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column (7 cols): Dynamic Connected Visual Component */}
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-3xl border border-[#49769F]/20 bg-white/95 p-5 sm:p-6 shadow-[0_20px_50px_-15px_rgba(0,29,57,0.08)] backdrop-blur-md min-h-[380px] sm:min-h-[420px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {activeStage === 0 && <StageVisualRole key="stage-0" />}
                  {activeStage === 1 && <StageVisualPersonalize key="stage-1" />}
                  {activeStage === 2 && <StageVisualInterview key="stage-2" />}
                  {activeStage === 3 && <StageVisualReport key="stage-3" />}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   VISUAL 01: CHOOSE YOUR ROLE INTERFACE
───────────────────────────────────────────────────────────── */
function StageVisualRole() {
  const [selectedRole, setSelectedRole] = useState("Software Engineer");

  const ROLES = [
    {
      id: "se",
      title: "Software Engineer",
      cat: "Engineering",
      icon: Code,
      tags: ["System Architecture", "Concurrency", "Algorithms"],
    },
    {
      id: "ds",
      title: "Data Scientist",
      cat: "Data & AI",
      icon: Brain,
      tags: ["Model Tuning", "Feature Engineering", "Statistics"],
    },
    {
      id: "ad",
      title: "Android Developer",
      cat: "Mobile",
      icon: Smartphone,
      tags: ["Kotlin", "Jetpack Compose", "Memory Profiling"],
    },
    {
      id: "da",
      title: "Data Analyst",
      cat: "Analytics",
      icon: BarChart3,
      tags: ["SQL Optimization", "ETL Pipelines", "Business KPIs"],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-3.5"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#49769F]">
            Interactive Catalog
          </span>
          <h4 className="font-display text-sm font-bold text-[#001D39]">
            Select Target Discipline
          </h4>
        </div>
        <span className="rounded-full bg-[#BDD8E9]/50 px-2.5 py-0.5 text-[11px] font-semibold text-[#0A4174] border border-[#7BBDE8]/30">
          22 Roles Supported
        </span>
      </div>

      {/* Role Option Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ROLES.map((r) => {
          const isSelected = selectedRole === r.title;
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.title)}
              className={`rounded-2xl border p-3 text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "border-[#0A4174] bg-[#BDD8E9]/20 shadow-sm ring-1 ring-[#0A4174]"
                  : "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-[#49769F]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-xl transition-colors ${
                    isSelected
                      ? "bg-[#0A4174] text-white"
                      : "bg-white text-[#49769F] border border-slate-200"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-[#49769F] border border-slate-200/60">
                  {r.cat}
                </span>
              </div>

              <div className="font-display text-xs font-bold text-[#001D39]">
                {r.title}
              </div>

              <div className="mt-1.5 flex flex-wrap gap-1">
                {r.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-[#49769F] border border-slate-200/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Role Confirmation Bar */}
      <div className="rounded-xl border border-[#4E8EA2]/30 bg-[#BDD8E9]/30 p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[#0A4174]" />
          <span className="font-semibold text-[#001D39]">
            Selected: <strong className="text-[#0A4174]">{selectedRole}</strong>
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#49769F]">
          6 Evaluated Competencies
        </span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VISUAL 02: PERSONALIZE YOUR INTERVIEW INTERFACE
───────────────────────────────────────────────────────────── */
function StageVisualPersonalize() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-3"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#49769F]">
            Dossier Assembly
          </span>
          <h4 className="font-display text-sm font-bold text-[#001D39]">
            Context Synthesis
          </h4>
        </div>
        <span className="rounded-md bg-[#BDD8E9]/50 px-2 py-0.5 text-[10px] font-bold text-[#0A4174] border border-[#7BBDE8]/40">
          Adaptive Engine
        </span>
      </div>

      {/* 3 Assembling Context Blocks */}
      <div className="space-y-2">
        {/* Role Block */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#001D39] text-white text-xs font-bold">
              1
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#49769F]">Target Role</div>
              <div className="text-xs font-bold text-[#001D39]">Senior Full Stack Developer</div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#0A4174] font-mono">Calibrated ✓</span>
        </div>

        {/* Company Block */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#0A4174] text-white text-xs font-bold">
              2
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#49769F]">Format Rubric</div>
              <div className="text-xs font-bold text-[#001D39]">Industry Benchmark Simulation</div>
            </div>
          </div>
          <span className="text-[11px] font-medium text-[#49769F]">Tier 1 Scale</span>
        </div>

        {/* Resume Block */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#4E8EA2] text-white text-xs font-bold">
              3
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-[#49769F]">Resume Context</div>
              <div className="text-xs font-bold text-[#001D39]">Resume_FullStack_2026.pdf</div>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[#0A4174] bg-[#BDD8E9]/40 px-2 py-0.5 rounded border border-[#7BBDE8]/30">
            8 Skills Parsed
          </span>
        </div>
      </div>

      {/* Generated Preview Card */}
      <div className="rounded-xl border border-[#7BBDE8]/40 bg-[#BDD8E9]/25 p-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A4174] mb-1">
          <Sparkles className="h-3.5 w-3.5 text-[#7BBDE8]" />
          <span>Tailored Question Generation Prompt Ready</span>
        </div>
        <p className="text-[11px] text-[#49769F] leading-relaxed">
          Questions will specifically reference high-throughput Node.js microservices and React state
          management derived from your uploaded resume projects.
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VISUAL 03: FACE THE AI INTERVIEW INTERFACE
───────────────────────────────────────────────────────────── */
function StageVisualInterview() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-3"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#7BBDE8] animate-pulse" />
          <span className="text-xs font-bold text-[#001D39]">Live Interview Session</span>
        </div>
        <span className="text-[11px] font-mono font-semibold text-[#49769F]">03:45 / 20:00</span>
      </div>

      {/* Primary Question Box */}
      <div className="rounded-xl border border-[#49769F]/20 bg-[#BDD8E9]/15 p-3">
        <div className="flex items-center justify-between text-[10px] font-bold text-[#49769F] uppercase tracking-wider mb-1">
          <span>Question 2 of 6 · Architecture</span>
          <span className="text-[#0A4174]">AI Active</span>
        </div>
        <p className="text-xs sm:text-[13px] font-bold text-[#001D39] leading-snug">
          "Can you describe an incident where a microservice degraded under load, and how you traced the bottleneck?"
        </p>
      </div>

      {/* Candidate Voice Transcript */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A4174] flex items-center gap-1">
            <Mic className="h-3 w-3 text-[#7BBDE8]" /> Candidate Speech Detected
          </span>
          <span className="text-[10px] font-mono text-[#49769F]">STAR: Action phase</span>
        </div>
        <p className="text-xs text-[#49769F] leading-relaxed italic">
          "We observed thread starvation on the database connection pool. I isolated connection timeouts using APM metrics, then configured pgbouncer with statement pooling..."
        </p>
      </div>

      {/* Dynamic Adaptive Probing Notification */}
      <div className="rounded-xl border border-[#7BBDE8]/50 bg-[#BDD8E9]/30 p-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#001D39] mb-0.5">
          <Sparkles className="h-3.5 w-3.5 text-[#0A4174]" />
          <span>Real-time Follow-up Generated</span>
        </div>
        <p className="text-[11px] text-[#0A4174]">
          "How did you verify that transaction-scoped session state wasn't corrupted in statement pooling mode?"
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   VISUAL 04: UNDERSTAND YOUR PERFORMANCE INTERFACE
───────────────────────────────────────────────────────────── */
function StageVisualReport() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full space-y-3.5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#49769F]">
            Session Analytics
          </span>
          <h4 className="font-display text-sm font-bold text-[#001D39]">
            AI Performance Evaluation
          </h4>
        </div>
        <span className="rounded-full bg-[#BDD8E9]/50 px-2.5 py-0.5 text-[10px] font-bold text-[#0A4174] border border-[#7BBDE8]/40">
          Ready for Onsite
        </span>
      </div>

      {/* Readiness Hero Metric */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#49769F]">
            Overall Readiness
          </span>
          <div className="font-display text-3xl font-extrabold text-[#001D39] mt-0.5">
            84<span className="text-lg text-[#49769F]">%</span>
          </div>
          <p className="text-[11px] text-[#0A4174] font-semibold mt-1">
            +9% improvement over baseline
          </p>
        </div>

        {/* Multi-Criteria Score Breakdown Bars */}
        <div className="w-44 space-y-2">
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-[#49769F] mb-0.5">
              <span>Technical Depth</span>
              <span className="font-bold text-[#001D39]">88%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#001D39]" style={{ width: "88%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-semibold text-[#49769F] mb-0.5">
              <span>STAR Communication</span>
              <span className="font-bold text-[#001D39]">82%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#0A4174]" style={{ width: "82%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-semibold text-[#49769F] mb-0.5">
              <span>Problem Solving Logic</span>
              <span className="font-bold text-[#001D39]">85%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-[#4E8EA2]" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Feedback Snippet */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-700">
        <div className="font-bold text-[#001D39] mb-1 flex items-center gap-1.5">
          <Award className="h-3.5 w-3.5 text-[#0A4174]" />
          <span>Key Strengths & Growth Areas</span>
        </div>
        <p className="text-[11px] text-[#49769F]">
          Strong architectural precision in handling concurrency. Recommendation: Quantify business
          impact metrics in the Result phase of your answers.
        </p>
      </div>
    </motion.div>
  );
}
