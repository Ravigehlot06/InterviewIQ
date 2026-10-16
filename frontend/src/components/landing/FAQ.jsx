import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Minus } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "What is InterviewIQ?",
    a: "InterviewIQ is an AI-powered adaptive mock interview platform that helps students and job seekers practice realistic interviews for different roles, receive relevant follow-up questions, and understand their interview performance with actionable readiness feedback.",
  },
  {
    q: "How does an AI mock interview work?",
    a: "You select your target role, difficulty, experience level, and optional target company. The AI interviewer asks role-specific questions, listens to your spoken or typed response, analyzes your structure, and dynamically generates follow-up probes based on what you actually answered.",
  },
  {
    q: "Can I practice for different job roles?",
    a: "Yes. InterviewIQ supports 22+ professional career tracks across Software Engineering, Data & AI, Product Management, System Architecture, Mobile Development, and Business Operations, each with dedicated competency evaluation rubrics.",
  },
  {
    q: "Can I select a target company?",
    a: "Yes. You can choose from industry benchmark simulations or select specific top technology company modes. These modes adjust question style, pacing, and evaluation rubrics based on authentic hiring philosophies (independent educational simulations, not officially affiliated).",
  },
  {
    q: "Can I upload my resume?",
    a: "Yes. When you upload your resume (PDF or DOCX), InterviewIQ parses your technical skills, work history, and project bullets to craft personalized questions grounded in your actual work experience.",
  },
  {
    q: "How does InterviewIQ personalize follow-up questions?",
    a: "Unlike scripted question banks, InterviewIQ evaluates your immediate response in real time. If your answer omits critical architectural details, trade-offs, or metric results, the AI formulates an adaptive probe challenging that specific gap.",
  },
  {
    q: "How is my interview performance evaluated?",
    a: "At the conclusion of each session, InterviewIQ evaluates your responses across multiple dimensions: Technical Accuracy, Communication Structure (STAR framework), Problem Solving, and Confidence. You receive an overall readiness estimate along with specific strengths and recommendations.",
  },
  {
    q: "Does InterviewIQ guarantee interview selection?",
    a: "No. InterviewIQ is an educational preparation platform designed to build familiarity, refine communication, and strengthen technical clarity through repeated practice. Hiring decisions are made solely by prospective employers according to their own internal standards.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="relative py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Left Column (5 cols): Sticky Headline */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#49769F]/20 bg-white/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#001D39] backdrop-blur-md shadow-xs">
                <span>Clarity & Methodology</span>
                <span className="text-[#0A4174]">·</span>
                <span className="text-[#49769F]">FAQ</span>
              </div>

              <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-[#001D39] sm:text-4xl lg:text-5xl leading-[1.12]">
                Frequently Asked Questions.
              </h2>

              <p className="mt-4 text-base sm:text-lg text-[#49769F] leading-relaxed font-normal">
                Clear, honest answers about our simulation methodology, adaptive questioning, and
                platform capabilities.
              </p>

              <div className="mt-8 rounded-2xl border border-[#49769F]/15 bg-white p-5 shadow-xs">
                <span className="text-xs font-bold text-[#001D39] block mb-1">
                  Have a specific question?
                </span>
                <p className="text-xs text-[#49769F] leading-relaxed">
                  Start an interview session or inspect the setup workflow to see all supported
                  career disciplines and options.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Accordion List */}
          <div className="lg:col-span-7 space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? "border-[#0A4174]/60 bg-white shadow-md shadow-[#001D39]/5 ring-1 ring-[#0A4174]/20"
                      : "border-[#49769F]/15 bg-white hover:border-[#7BBDE8]/40 shadow-xs"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left cursor-pointer gap-4"
                  >
                    <span className="font-display text-sm sm:text-base font-bold text-[#001D39]">
                      {item.q}
                    </span>
                    <span
                      className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border transition-all duration-200 ${
                        isOpen
                          ? "border-[#0A4174] bg-[#0A4174] text-white"
                          : "border-[#49769F]/30 bg-[#BDD8E9]/30 text-[#49769F] hover:bg-[#BDD8E9]/50"
                      }`}
                    >
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm leading-relaxed text-[#49769F] border-t border-slate-100 pt-3">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
