import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Cpu,
  Briefcase,
  Building2,
  ArrowUpRight,
  Clock,
  Sparkles,
} from "lucide-react";

const INTERVIEW_TYPES = [
  {
    id: "technical",
    title: "Technical Interviews",
    subtitle: "Architecture, algorithms, and technical trade-offs",
    icon: Cpu,
    badge: "Core Engineering",
    duration: "6–8 Questions · ~25–35 mins",
    sampleQuestion:
      "How would you design a globally distributed rate-limiting service to prevent API abuse while maintaining sub-5ms latency?",
    focusAreas: ["System Architecture", "Concurrency & Locks", "Data Modeling", "Scalability"],
  },
  {
    id: "hr",
    title: "HR & Behavioral Rounds",
    subtitle: "STAR method, leadership, and cross-functional culture fit",
    icon: Users,
    badge: "Behavioral & STAR",
    duration: "4–6 Questions · ~15–25 mins",
    sampleQuestion:
      "Tell me about a high-stakes disagreement you had with an engineering manager or product lead. How did you advocate your perspective and align?",
    focusAreas: ["Situation-Task-Action-Result", "Conflict Resolution", "Communication", "Ownership"],
  },
  {
    id: "role_based",
    title: "Role-Based Practical Challenges",
    subtitle: "Day-to-day scenarios and discipline-specific trade-offs",
    icon: Briefcase,
    badge: "Domain Specific",
    duration: "5–6 Questions · ~20–30 mins",
    sampleQuestion:
      "You notice that a microservice latency spiked by 350% during peak user traffic after yesterday's release. Walk me through your root-cause analysis.",
    focusAreas: ["Production Triage", "Practical Tooling", "Code Quality", "Incident Management"],
  },
  {
    id: "company",
    title: "Target-Company Simulation",
    subtitle: "Calibrated to the pacing and rubrics of top tech tiers",
    icon: Building2,
    badge: "Simulated Rubric",
    duration: "6–8 Questions · ~30–40 mins",
    sampleQuestion:
      "FAANG-style inquiry: Design an end-to-end distributed photo sharing ingest pipeline with CDN caching and asynchronous thumbnail transcoding.",
    focusAreas: ["Company Pacing", "Rubric Evaluation", "Depth of Probing", "Leadership Principles"],
    disclaimer: "Independent educational simulation; not affiliated with or endorsed by any named company.",
  },
];

export default function InterviewTypes() {
  return (
    <section id="interview-types" className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#49769F]/20 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#001D39] backdrop-blur-md shadow-xs">
            <span>Interview Taxonomy</span>
            <span className="text-[#0A4174]">·</span>
            <span className="text-[#49769F]">Comprehensive Coverage</span>
          </div>

          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#001D39] sm:text-4xl lg:text-5xl leading-[1.12]">
            One platform. Different interview challenges.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-[#49769F] leading-relaxed font-normal">
            Calibrate your preparation to the exact stage of the interview loop you are scheduled
            to take. Each format activates tailored evaluation rubrics and probing depths.
          </p>
        </div>

        {/* ── 4 DISTINCT INTERVIEW CATEGORIES (2x2 Grid) ── */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {INTERVIEW_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.id}
                className="group rounded-[32px] border border-[#49769F]/15 bg-white p-6 sm:p-8 lg:p-9 shadow-[0_12px_35px_-10px_rgba(0,29,57,0.04)] transition-all duration-200 hover:border-[#7BBDE8]/50 hover:shadow-[0_20px_45px_-12px_rgba(0,29,57,0.08)] flex flex-col justify-between"
              >
                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#BDD8E9]/50 text-[#001D39] border border-[#7BBDE8]/30 transition-colors group-hover:bg-[#001D39] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="rounded-full bg-[#BDD8E9]/40 px-3 py-1 text-[11px] font-bold text-[#0A4174] border border-[#7BBDE8]/30">
                      {type.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-[#001D39] tracking-tight">
                    {type.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-[#49769F] leading-relaxed">
                    {type.subtitle}
                  </p>

                  {/* Sample Question Mockup */}
                  <div className="mt-5 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#49769F] mb-1.5">
                      <span>Representative Question</span>
                      <span className="text-[#0A4174] flex items-center gap-1 font-semibold">
                        <Sparkles className="h-3 w-3" /> Adaptive
                      </span>
                    </div>
                    <p className="font-medium text-[#001D39] leading-relaxed">
                      "{type.sampleQuestion}"
                    </p>
                  </div>

                  {/* Focus Area Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {type.focusAreas.map((area) => (
                      <span
                        key={area}
                        className="rounded-lg bg-white border border-[#49769F]/15 px-2 py-1 text-[11px] font-medium text-[#49769F]"
                      >
                        {area}
                      </span>
                    ))}
                  </div>

                  {type.disclaimer && (
                    <p className="mt-3 text-[11px] text-[#49769F]/60 italic">
                      * {type.disclaimer}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#49769F] flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#6EA2B3]" />
                    {type.duration}
                  </span>

                  <Link
                    to="/interview/setup"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0A4174] hover:text-[#001D39] transition-colors"
                  >
                    <span>Practice this format</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
