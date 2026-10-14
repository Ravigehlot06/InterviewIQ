import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  SkipForward,
  Sparkles,
  Check,
  Building2,
  FileText,
  UploadCloud,
  GraduationCap,
  Code,
  Layers,
  ShieldCheck,
  Zap,
  Target,
  Award,
  Users,
  Terminal,
  Briefcase,
  Globe,
  Clock,
  Search,
  CheckCircle2,
  Brain,
  Cpu,
  BarChart3,
  Smartphone,
  ChevronRight,
  X,
  Compass,
  Palette,
  Kanban,
  LineChart,
  Megaphone,
  Network
} from "lucide-react";
import { catalogService, resumeService, interviewService } from "../services";
import { getApiErrorMessage } from "../services/api";
import { Spinner } from "../components/ui/Primitives";
import { DEFAULT_ROLES } from "../components/interview/RoleSelectionLiquid";

const ROLE_ICONS = {
  Code,
  Layers,
  Layout: Code,
  Server: Terminal,
  BarChart3,
  Brain,
  Cpu,
  Cloud: Globe,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Network,
  Compass,
  Palette,
  Kanban,
  LineChart,
  Users,
  Megaphone,
  Briefcase,
  Globe,
};

const EXPERIENCE_CARDS = [
  {
    value: "fresher",
    label: "Fresher / Entry Level",
    subtitle: "0 years · Academic & Foundations",
    icon: GraduationCap,
    badge: "Foundations",
    description: "Evaluates core computer science concepts, basic data structures, problem-solving potential, and university projects.",
  },
  {
    value: "0-2",
    label: "Junior / Associate",
    subtitle: "0-2 years · Practical Execution",
    icon: Code,
    badge: "Hands-On",
    description: "Focuses on clean code syntax, practical implementation, debugging, component development, and team collaboration.",
  },
  {
    value: "2-5",
    label: "Mid-Level Professional",
    subtitle: "2-5 years · Independent Ownership",
    icon: Layers,
    badge: "Most Common",
    description: "Evaluates end-to-end feature ownership, database optimization, system trade-offs, testing, and production best practices.",
  },
  {
    value: "5+",
    label: "Senior / Staff Engineer",
    subtitle: "5+ years · Architecture & Leadership",
    icon: ShieldCheck,
    badge: "Leadership",
    description: "Deep dive into distributed systems, cross-team architecture, failure resilience, scalability, and technical strategy.",
  },
];

const DIFFICULTY_CARDS = [
  {
    value: "easy",
    label: "Easy Difficulty",
    subtitle: "Gentle Pacing & Fundamental Concepts",
    badge: "Warm-Up",
    accentColor: "emerald",
    gradientClass: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    borderClass: "hover:border-emerald-500/50",
    activeClass: "border-emerald-500 bg-emerald-950/40 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/80",
    description: "Clear, predictable questions with supportive follow-ups. Perfect for warming up or building confidence before serious tests.",
    idealFor: "Entry-level candidates and first-time practice sessions",
  },
  {
    value: "medium",
    label: "Medium Difficulty",
    subtitle: "Realistic Industry Hiring Benchmark",
    badge: "Recommended",
    accentColor: "indigo",
    gradientClass: "from-indigo-500/20 via-indigo-500/10 to-transparent",
    borderClass: "hover:border-indigo-500/50",
    activeClass: "border-indigo-500 bg-indigo-950/40 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)] ring-2 ring-indigo-500/80",
    description: "The authentic standard hiring bar. Balanced mix of theoretical concepts, live scenario problem-solving, and probing follow-ups.",
    idealFor: "Simulating authentic technical & behavioral interviews",
  },
  {
    value: "hard",
    label: "Hard Difficulty",
    subtitle: "High-Pressure Bar-Raiser Simulation",
    badge: "Bar Raiser",
    accentColor: "rose",
    gradientClass: "from-rose-500/20 via-rose-500/10 to-transparent",
    borderClass: "hover:border-rose-500/50",
    activeClass: "border-rose-500 bg-rose-950/40 shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] ring-2 ring-rose-500/80",
    description: "Exhaustive challenge featuring edge cases, distributed concurrency, deep algorithmic grilling, and rapid situational pivots.",
    idealFor: "FAANG, tier-1 tech firms, and high-stakes interviews",
  },
];

const TYPE_CARDS = [
  {
    value: "hr",
    label: "HR & Behavioral",
    subtitle: "Cultural Alignment & Leadership",
    icon: Users,
    badge: "STAR Method",
    description: "Scenario-based behavioral questions evaluated against leadership principles, conflict management, communication, and culture fit.",
  },
  {
    value: "technical",
    label: "Technical Deep-Dive",
    subtitle: "Domain Rigor & Engineering Logic",
    icon: Terminal,
    badge: "Core Tech",
    description: "Rigorous assessment of computer science foundations, algorithm logic, system internals, syntax conventions, and code architecture.",
  },
  {
    value: "role_based",
    label: "Role-Based Practical",
    subtitle: "Daily Job Scenarios & Trade-offs",
    icon: Briefcase,
    badge: "Practical",
    description: "Realistic day-in-the-life challenges directly tailored to your target job role, balancing practical trade-offs and decision making.",
  },
  {
    value: "company",
    label: "Target Company Simulation",
    subtitle: "Company-Specific Culture & Rubric",
    icon: Building2,
    badge: "Tailored",
    description: "Simulates the exact interview philosophy, question format, core principles, and evaluation criteria of your chosen target company.",
  },
];

const DURATION_CARDS = [
  {
    value: 4,
    label: "4 Questions",
    subtitle: "Quick Drill (~12-15 minutes)",
    icon: Zap,
    badge: "Fast Practice",
    description: "Targeted quick session. Ideal when you have limited time or want immediate feedback on specific concepts without fatigue.",
  },
  {
    value: 6,
    label: "6 Questions",
    subtitle: "Standard Mock (~20-25 minutes)",
    icon: Target,
    badge: "Recommended",
    description: "Full authentic simulation with primary questions, adaptive follow-up probes, and comprehensive ML readiness scoring.",
  },
  {
    value: 8,
    label: "8 Questions",
    subtitle: "Comprehensive (~35-40 minutes)",
    icon: Award,
    badge: "Exhaustive",
    description: "Deep assessment covering wide technical breadth, architectural trade-offs, and behavioral resilience under extended pressure.",
  },
];

const SCREENS = ["role", "company", "resume", "experience", "difficulty", "type", "duration"];

const STEP_META = {
  role: {
    badge: "Role Selection",
    title: "Select Your Target Role",
    subtitle: "Choose the exact role you're interviewing for so our AI dynamically adapts the question bank.",
  },
  company: {
    badge: "Company Alignment",
    title: "Choose a Target Company",
    subtitle: "Select a specific company to simulate their culture and bar, or practice with general industry standards.",
  },
  resume: {
    badge: "Resume Personalization",
    title: "Personalize with Your Resume",
    subtitle: "Attach an existing resume or upload a new one to receive questions based on your real career experience.",
  },
  experience: {
    badge: "Seniority Calibration",
    title: "Select Your Experience Level",
    subtitle: "Calibrates the technical complexity, expectation level, and evaluation standard of the mock interview.",
  },
  difficulty: {
    badge: "Challenge Level",
    title: "Choose Interview Difficulty",
    subtitle: "Controls how aggressively the AI probes your responses and pushes into edge cases.",
  },
  type: {
    badge: "Interview Style",
    title: "Choose Interview Type",
    subtitle: "Select the specific interview format and evaluation framework for this session.",
  },
  duration: {
    badge: "Session Length",
    title: "Set Interview Question Count",
    subtitle: "Choose how many questions to practice today. All sessions include instant AI evaluation and ML readiness.",
  },
};

export default function InterviewSetup() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [screenIdx, setScreenIdx] = useState(0);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Role screen search & filter state
  const [roleSearch, setRoleSearch] = useState("");
  const [roleCategory, setRoleCategory] = useState("all");

  const [config, setConfig] = useState({
    role_id: 1, // Default to Software Developer
    company_id: null,
    resume_id: null,
    experience_level: "fresher",
    difficulty: "medium",
    interview_type: "technical",
    planned_questions: 6,
  });

  useEffect(() => {
    catalogService.roles().then((backendRoles) => {
      // Merge backend roles with rich DEFAULT_ROLES metadata
      const merged = backendRoles.map((br) => {
        const enriched = DEFAULT_ROLES.find((dr) => dr.id === br.id || dr.slug === br.slug);
        return enriched ? { ...enriched, id: br.id, name: br.name, slug: br.slug } : br;
      });
      setRoles(merged.length > 0 ? merged : DEFAULT_ROLES);
      if (merged.length > 0 && !config.role_id) {
        setConfig((c) => ({ ...c, role_id: merged[0].id }));
      }
    }).catch(() => {
      setRoles(DEFAULT_ROLES);
    });

    catalogService.companies().then(setCompanies).catch(() => {});
    resumeService.list().then(setResumes).catch(() => {});
  }, []);

  const screen = SCREENS[screenIdx];
  const stepMeta = STEP_META[screen];

  const goNext = () => setScreenIdx((i) => Math.min(i + 1, SCREENS.length - 1));
  const goBack = () => setScreenIdx((i) => Math.max(i - 1, 0));

  const canProceed = useMemo(() => {
    if (screen === "role") return !!config.role_id;
    return true;
  }, [screen, config.role_id]);

  // Handle direct resume upload from setup screen
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    setError("");
    try {
      const res = await resumeService.upload(file);
      const updated = await resumeService.list();
      setResumes(updated);
      if (res?.resume?.id) {
        setConfig((c) => ({ ...c, resume_id: res.resume.id }));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to upload resume. Make sure it is a valid PDF or DOCX."));
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const startInterview = async () => {
    setStarting(true);
    setError("");
    try {
      const result = await interviewService.create(config);
      navigate(`/interview/${result.interview.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not start the interview session. Please try again."));
    } finally {
      setStarting(false);
    }
  };

  // Filtered roles for Role Selection screen
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const matchesSearch =
        !roleSearch.trim() ||
        r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
        (r.description && r.description.toLowerCase().includes(roleSearch.toLowerCase()));

      let matchesCat = true;
      if (roleCategory === "technical") {
        matchesCat = r.category === "technical" || ["software-developer", "fullstack-developer", "frontend-developer", "backend-developer", "devops-engineer", "cybersecurity-analyst", "qa-engineer", "systems-architect", "web-developer", "android-developer", "mobile-developer"].includes(r.slug);
      } else if (roleCategory === "data") {
        matchesCat = ["data-analyst", "data-scientist", "ai-ml-engineer"].includes(r.slug);
      } else if (roleCategory === "product") {
        matchesCat = ["product-manager", "ui-ux-designer", "project-manager"].includes(r.slug);
      } else if (roleCategory === "business") {
        matchesCat = ["business-analyst", "marketing-specialist", "sales-account-executive", "hr-specialist", "financial-analyst", "operations-manager", "customer-success-manager"].includes(r.slug);
      }

      return matchesSearch && matchesCat;
    });
  }, [roles, roleSearch, roleCategory]);

  // Selected names for live breadcrumb
  const selectedRole = roles.find((r) => r.id === config.role_id);
  const selectedCompany = companies.find((c) => c.id === config.company_id);
  const selectedExp = EXPERIENCE_CARDS.find((e) => e.value === config.experience_level);
  const selectedDiff = DIFFICULTY_CARDS.find((d) => d.value === config.difficulty);
  const selectedType = TYPE_CARDS.find((t) => t.value === config.interview_type);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#060813] via-[#0d1329] to-[#150f2e] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Ambient gradient lights in the background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-40 h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 h-[520px] w-[520px] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      </div>

      {/* Main Full-Page Content Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-8 py-6 sm:py-8">
        {/* Top Navigation & Status Bar */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          {/* Exit / Return to Dashboard */}
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Dashboard</span>
          </button>

          {/* Clean Step Counter Pill (Replaces ugly progress bar) */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              Step {screenIdx + 1} of {SCREENS.length} · {stepMeta.badge}
            </span>
          </div>

          {/* Live Selection Summary */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
            <span className="text-slate-200 font-semibold">{selectedRole?.name || "Select Role"}</span>
            {selectedCompany && <span>· {selectedCompany.name}</span>}
            {screenIdx >= 3 && <span>· {selectedExp?.label.split(" ")[0]}</span>}
            {screenIdx >= 4 && <span>· {selectedDiff?.label.split(" ")[0]}</span>}
          </div>
        </header>

        {/* Step Title Header */}
        <div className="mt-8 mb-6 sm:mt-10 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            {stepMeta.title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-3xl">
            {stepMeta.subtitle}
          </p>
        </div>

        {/* Dynamic Card Screens */}
        <div className="flex-1 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full"
            >
              {/* SCREEN 1: ROLES */}
              {screen === "role" && (
                <div className="space-y-6">
                  {/* Search and Category Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        placeholder="Search roles (e.g. Full Stack, AI Engineer, Product)..."
                        className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-400 backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {roleSearch && (
                        <button
                          onClick={() => setRoleSearch("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: "all", label: "All Roles" },
                        { id: "technical", label: "Engineering" },
                        { id: "data", label: "Data & AI" },
                        { id: "product", label: "Product & Design" },
                        { id: "business", label: "Business & Ops" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setRoleCategory(cat.id)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                            roleCategory === cat.id
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                              : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Full-Page Role Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoles.map((r) => {
                      const isSelected = config.role_id === r.id;
                      const IconComp = ROLE_ICONS[r.icon] || Code;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setConfig({ ...config, role_id: r.id })}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-5 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:shadow-lg hover:-translate-y-0.5"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              {/* Icon Container */}
                              <div
                                className={`grid h-11 w-11 place-items-center rounded-xl border transition-colors ${
                                  isSelected
                                    ? "border-indigo-400/40 bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                                    : "border-white/10 bg-white/[0.06] text-indigo-300 group-hover:border-indigo-400/30 group-hover:text-indigo-200"
                                }`}
                              >
                                <IconComp className="h-5 w-5" />
                              </div>

                              {/* Selection Badge / Indicator */}
                              {isSelected ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                  Selected
                                </span>
                              ) : (
                                <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                                  {r.categoryLabel || "Specialist"}
                                </span>
                              )}
                            </div>

                            {/* Role Details */}
                            <h3 className="mt-4 font-display text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                              {r.name}
                            </h3>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-300">
                              {r.description || "Industry benchmark evaluation covering primary domain competencies and problem solving."}
                            </p>
                          </div>

                          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-slate-400">
                            <span>Evaluated with AI follow-ups</span>
                            <ChevronRight className={`h-3.5 w-3.5 transition-transform ${isSelected ? "text-indigo-400 translate-x-0.5" : "text-slate-500 group-hover:translate-x-0.5"}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCREEN 2: TARGET COMPANY */}
              {screen === "company" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {/* General / Neutral Option Card */}
                    <div
                      onClick={() => setConfig({ ...config, company_id: null })}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                        config.company_id === null
                          ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:-translate-y-0.5"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="grid h-12 w-12 place-items-center rounded-xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
                            <Globe className="h-6 w-6" />
                          </div>
                          {config.company_id === null && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="mt-5 font-display text-lg font-bold text-white">
                          General Industry Practice
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">
                          Comprehensive evaluation against standard global hiring benchmarks without company-specific bias.
                        </p>
                      </div>
                      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center text-[11px] font-semibold text-indigo-300">
                        Recommended for general prep
                      </div>
                    </div>

                    {/* Specific Company Cards */}
                    {companies.map((c) => {
                      const isSelected = config.company_id === c.id;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setConfig({ ...config, company_id: isSelected ? null : c.id })}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:-translate-y-0.5"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/[0.08] text-indigo-300 group-hover:border-indigo-400/40">
                                <Building2 className="h-6 w-6 text-indigo-400" />
                              </div>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                  Selected
                                </span>
                              )}
                            </div>
                            <h3 className="mt-5 font-display text-lg font-bold text-white">
                              {c.name}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed text-slate-300">
                              Simulates authentic interview expectations, cultural principles, and technical pacing known for {c.name}.
                            </p>
                          </div>
                          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center text-[11px] font-semibold text-slate-400">
                            Simulated Interview Format
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCREEN 3: RESUME */}
              {screen === "resume" && (
                <div className="space-y-6">
                  {/* Hidden file upload input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf,.docx"
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* Card 1: Practice Without Resume */}
                    <div
                      onClick={() => setConfig({ ...config, resume_id: null })}
                      className={`group relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                        config.resume_id === null
                          ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                          : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:-translate-y-0.5"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="grid h-12 w-12 place-items-center rounded-xl border border-indigo-400/30 bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
                            <Zap className="h-6 w-6" />
                          </div>
                          {config.resume_id === null && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                              <Check className="h-3 w-3" strokeWidth={3} />
                              Active
                            </span>
                          )}
                        </div>
                        <h3 className="mt-5 font-display text-lg font-bold text-white">
                          Continue Without Resume
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-300">
                          Interview questions will be calibrated dynamically to your chosen role, seniority, and difficulty parameters.
                        </p>
                      </div>
                      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center text-[11px] font-semibold text-indigo-300">
                        Fastest start · No upload required
                      </div>
                    </div>

                    {/* Cards for each uploaded resume */}
                    {resumes.map((r) => {
                      const isSelected = config.resume_id === r.id;
                      return (
                        <div
                          key={r.id}
                          onClick={() => setConfig({ ...config, resume_id: isSelected ? null : r.id })}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:-translate-y-0.5"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/15 bg-white/[0.08] text-indigo-400">
                                <FileText className="h-6 w-6" />
                              </div>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                  Attached
                                </span>
                              )}
                            </div>
                            <h3 className="mt-5 font-display text-base font-bold text-white truncate max-w-[240px]">
                              {r.original_filename}
                            </h3>
                            <p className="mt-2 text-xs text-slate-400">
                              Uploaded {new Date(r.created_at).toLocaleDateString()}
                            </p>
                            <p className="mt-1 text-xs text-slate-300">
                              Personalizes questions based on your parsed skills, projects, and work history.
                            </p>
                          </div>
                          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-2.5 text-center text-[11px] font-semibold text-emerald-300">
                            Resume Parser Ready
                          </div>
                        </div>
                      );
                    })}

                    {/* Card: Upload New Resume */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center backdrop-blur-md transition-all hover:border-indigo-400/60 hover:bg-white/[0.05] cursor-pointer"
                    >
                      <div className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-white/[0.06] text-indigo-400 group-hover:scale-110 transition-transform">
                        {uploadingResume ? <Spinner /> : <UploadCloud className="h-6 w-6" />}
                      </div>
                      <h3 className="mt-4 font-display text-base font-bold text-white">
                        {uploadingResume ? "Uploading & Parsing..." : "Upload New Resume"}
                      </h3>
                      <p className="mt-1.5 text-xs text-slate-400 max-w-[200px]">
                        Supports PDF or DOCX (Max 5MB). Automatically attaches upon upload.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* SCREEN 4: EXPERIENCE LEVEL */}
              {screen === "experience" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {EXPERIENCE_CARDS.map((opt) => {
                    const isSelected = config.experience_level === opt.value;
                    const IconComp = opt.icon;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setConfig({ ...config, experience_level: opt.value })}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:-translate-y-0.5"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className={`grid h-12 w-12 place-items-center rounded-xl border ${
                              isSelected
                                ? "border-indigo-400/40 bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                                : "border-white/10 bg-white/[0.06] text-indigo-300"
                            }`}>
                              <IconComp className="h-6 w-6" />
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                              {opt.badge}
                            </span>
                          </div>

                          <h3 className="mt-5 font-display text-lg font-bold text-white">
                            {opt.label}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-indigo-400">
                            {opt.subtitle}
                          </p>
                          <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
                            {opt.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-3">
                          <span className="text-[11px] text-slate-400">Target evaluation standard</span>
                          {isSelected && <Check className="h-4 w-4 text-indigo-400" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SCREEN 5: DIFFICULTY */}
              {screen === "difficulty" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {DIFFICULTY_CARDS.map((opt) => {
                    const isSelected = config.difficulty === opt.value;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setConfig({ ...config, difficulty: opt.value })}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-7 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? opt.activeClass
                            : `border-white/10 bg-white/[0.04] hover:bg-white/[0.07] ${opt.borderClass} hover:-translate-y-0.5`
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                              isSelected ? "bg-white text-slate-900" : "bg-white/10 text-slate-300"
                            }`}>
                              {opt.badge}
                            </span>
                            {isSelected && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-bold text-white">
                                <Check className="h-3 w-3" strokeWidth={3} /> Selected
                              </span>
                            )}
                          </div>

                          <h3 className="mt-5 font-display text-2xl font-extrabold text-white">
                            {opt.label}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-indigo-300">
                            {opt.subtitle}
                          </p>
                          <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                            {opt.description}
                          </p>
                        </div>

                        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-slate-300">
                          <span className="font-semibold text-white">Ideal for:</span> {opt.idealFor}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SCREEN 6: INTERVIEW TYPE */}
              {screen === "type" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {TYPE_CARDS.map((opt) => {
                    const isSelected = config.interview_type === opt.value;
                    const IconComp = opt.icon;
                    return (
                      <div
                        key={opt.value}
                        onClick={() => setConfig({ ...config, interview_type: opt.value })}
                        className={`group relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:-translate-y-0.5"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className={`grid h-12 w-12 place-items-center rounded-xl border ${
                              isSelected
                                ? "border-indigo-400/40 bg-indigo-600 text-white shadow-md"
                                : "border-white/10 bg-white/[0.06] text-indigo-300"
                            }`}>
                              <IconComp className="h-6 w-6" />
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-semibold text-slate-400">
                              {opt.badge}
                            </span>
                          </div>

                          <h3 className="mt-5 font-display text-lg font-bold text-white">
                            {opt.label}
                          </h3>
                          <p className="mt-1 text-xs font-semibold text-indigo-400">
                            {opt.subtitle}
                          </p>
                          <p className="mt-2.5 text-xs leading-relaxed text-slate-300">
                            {opt.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-3">
                          <span className="text-[11px] text-slate-400">Rubric aligned</span>
                          {isSelected && <Check className="h-4 w-4 text-indigo-400" strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* SCREEN 7: DURATION / QUESTIONS */}
              {screen === "duration" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {DURATION_CARDS.map((opt) => {
                      const isSelected = config.planned_questions === opt.value;
                      const IconComp = opt.icon;
                      return (
                        <div
                          key={opt.value}
                          onClick={() => setConfig({ ...config, planned_questions: opt.value })}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-7 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-950/40 shadow-[0_0_35px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
                              : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-indigo-400/50 hover:-translate-y-0.5"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <div className={`grid h-12 w-12 place-items-center rounded-xl border ${
                                isSelected
                                  ? "border-indigo-400/40 bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                                  : "border-white/10 bg-white/[0.06] text-indigo-300"
                              }`}>
                                <IconComp className="h-6 w-6" />
                              </div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                isSelected ? "bg-indigo-500 text-white" : "border border-white/10 bg-white/[0.05] text-slate-300"
                              }`}>
                                {opt.badge}
                              </span>
                            </div>

                            <h3 className="mt-5 font-display text-3xl font-extrabold text-white">
                              {opt.label}
                            </h3>
                            <p className="mt-1 text-xs font-semibold text-indigo-400">
                              {opt.subtitle}
                            </p>
                            <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-slate-300">
                              {opt.description}
                            </p>
                          </div>

                          <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center text-xs text-slate-300">
                            Includes live AI feedback + ML readiness report
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Bottom Action Navigation Bar */}
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#090d19]/90 px-4 sm:px-8 py-4 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          {/* Back Button */}
          <button
            onClick={goBack}
            disabled={screenIdx === 0}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              screenIdx === 0
                ? "cursor-not-allowed opacity-30 text-slate-500"
                : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {/* Center Summary Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-white font-semibold">{selectedRole?.name}</span>
            <span>·</span>
            <span>{selectedCompany?.name || "General Practice"}</span>
            <span>·</span>
            <span className="capitalize">{config.difficulty} Difficulty</span>
            <span>·</span>
            <span>{config.planned_questions} Questions</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {["company", "resume"].includes(screen) && (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/[0.06] hover:text-white transition-all"
              >
                <span>Skip</span>
                <SkipForward className="h-3.5 w-3.5" />
              </button>
            )}

            {screen === "duration" ? (
              <button
                onClick={startInterview}
                disabled={starting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:shadow-indigo-600/50 disabled:opacity-50"
              >
                {starting ? (
                  <>
                    <Spinner />
                    <span>Preparing Interview Room...</span>
                  </>
                ) : (
                  <>
                    <span>Start Mock Interview</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canProceed}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              >
                <span>Next Step</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
