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
    subtitle: "0 years · Academic",
    icon: GraduationCap,
    badge: "Foundations",
    description: "Evaluates core computer science concepts, basic data structures, problem-solving potential, and university projects.",
  },
  {
    value: "0-2",
    label: "Junior / Associate",
    subtitle: "0-2 years · Hands-On",
    icon: Code,
    badge: "Execution",
    description: "Focuses on clean code syntax, practical implementation, debugging, component development, and team collaboration.",
  },
  {
    value: "2-5",
    label: "Mid-Level Professional",
    subtitle: "2-5 years · Independent",
    icon: Layers,
    badge: "Recommended",
    description: "Evaluates end-to-end feature ownership, database optimization, system trade-offs, testing, and production best practices.",
  },
  {
    value: "5+",
    label: "Senior / Staff Engineer",
    subtitle: "5+ years · Architecture",
    icon: ShieldCheck,
    badge: "Leadership",
    description: "Deep dive into distributed systems, cross-team architecture, failure resilience, scalability, and technical strategy.",
  },
];

const DIFFICULTY_CARDS = [
  {
    value: "easy",
    label: "Easy Difficulty",
    subtitle: "Gentle pacing & core concepts",
    badge: "Warm-Up",
    accent: "emerald",
    description: "Clear, predictable questions with supportive follow-ups. Perfect for warming up or building confidence before high-stakes tests.",
  },
  {
    value: "medium",
    label: "Medium Difficulty",
    subtitle: "Standard industry hiring bar",
    badge: "Recommended",
    accent: "indigo",
    description: "The authentic standard hiring bar. Balanced mix of theoretical concepts, live scenario problem-solving, and probing follow-ups.",
  },
  {
    value: "hard",
    label: "Hard Difficulty",
    subtitle: "High-pressure bar raiser",
    badge: "Bar Raiser",
    accent: "rose",
    description: "Exhaustive challenge featuring edge cases, distributed concurrency, deep algorithmic grilling, and rapid situational pivots.",
  },
];

const TYPE_CARDS = [
  {
    value: "hr",
    label: "HR & Behavioral",
    subtitle: "STAR method & culture",
    icon: Users,
    badge: "Behavioral",
    description: "Scenario-based questions evaluated against leadership principles, conflict management, communication, and team alignment.",
  },
  {
    value: "technical",
    label: "Technical Deep-Dive",
    subtitle: "Domain rigor & architecture",
    icon: Terminal,
    badge: "Engineering",
    description: "Rigorous assessment of computer science foundations, algorithm logic, system internals, syntax conventions, and code design.",
  },
  {
    value: "role_based",
    label: "Role-Based Practical",
    subtitle: "Daily challenges & trade-offs",
    icon: Briefcase,
    badge: "Practical",
    description: "Realistic day-in-the-life challenges directly tailored to your target job role, balancing practical trade-offs and decision making.",
  },
  {
    value: "company",
    label: "Company Simulation",
    subtitle: "Company rubric & values",
    icon: Building2,
    badge: "Company Style",
    description: "Simulates the exact interview philosophy, question format, core principles, and evaluation criteria of your chosen target company.",
  },
];

const DURATION_CARDS = [
  {
    value: 4,
    label: "4 Questions",
    subtitle: "Quick Drill (~12-15 mins)",
    icon: Zap,
    badge: "Fast Practice",
    description: "Targeted quick session. Ideal when you have limited time or want immediate feedback on specific concepts without fatigue.",
  },
  {
    value: 6,
    label: "6 Questions",
    subtitle: "Standard Mock (~20-25 mins)",
    icon: Target,
    badge: "Recommended",
    description: "Full authentic simulation with primary questions, adaptive follow-up probes, and comprehensive ML readiness scoring.",
  },
  {
    value: 8,
    label: "8 Questions",
    subtitle: "Comprehensive (~35-40 mins)",
    icon: Award,
    badge: "Exhaustive",
    description: "Deep assessment covering wide technical breadth, architectural trade-offs, and behavioral resilience under extended pressure.",
  },
];

const SCREENS = ["role", "company", "resume", "experience", "difficulty", "type", "duration"];

const STEP_META = {
  role: {
    badge: "Role",
    title: "Select Your Target Role",
    subtitle: "Pick the role you're preparing for. Hover over any card to view tested competencies.",
  },
  company: {
    badge: "Company",
    title: "Choose Target Company",
    subtitle: "Select a specific company format or general industry practice. Hover for format details.",
  },
  resume: {
    badge: "Resume",
    title: "Resume Personalization",
    subtitle: "Attach a resume for personalized questions, or continue with dynamic role generation.",
  },
  experience: {
    badge: "Experience",
    title: "Select Experience Level",
    subtitle: "Calibrates question depth and expected seniority standards. Hover for evaluation criteria.",
  },
  difficulty: {
    badge: "Difficulty",
    title: "Choose Difficulty",
    subtitle: "Controls how aggressively the AI probes your responses and pushes into edge cases.",
  },
  type: {
    badge: "Interview Type",
    title: "Choose Interview Format",
    subtitle: "Select the format and evaluation framework. Hover for focus area breakdown.",
  },
  duration: {
    badge: "Length",
    title: "Question Count",
    subtitle: "Choose session length. All mock interviews include instant AI feedback and ML readiness.",
  },
};

/**
 * RoleOptionCard
 * Spacious, rich interactive card for role choosing in practice setup.
 * No internal scroll: expands smoothly in a responsive grid.
 * Features hover animations, color shifts, glowing borders, and prominent iconography.
 */
function RoleOptionCard({
  icon: Icon,
  title,
  subtitle,
  categoryLabel,
  description,
  selected,
  onClick,
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      onClick={onClick}
      className={`group relative flex flex-col justify-between rounded-2xl border p-5 text-left transition-all duration-200 cursor-pointer min-h-[175px] ${
        selected
          ? "border-indigo-500 bg-gradient-to-br from-indigo-950/70 via-[#101738] to-violet-950/60 ring-2 ring-indigo-500/80 shadow-[0_0_35px_-5px_rgba(99,102,241,0.45)]"
          : "border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] hover:border-indigo-400/70 hover:bg-gradient-to-br hover:from-white/[0.08] hover:via-indigo-950/30 hover:to-violet-950/25 hover:shadow-[0_12px_35px_-8px_rgba(99,102,241,0.35)]"
      }`}
    >
      {/* Top row: Icon + Category Badge + Selected Indicator */}
      <div className="flex w-full items-start justify-between gap-3">
        <div
          className={`grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border transition-all duration-200 ${
            selected
              ? "border-indigo-400/50 bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
              : "border-white/10 bg-white/[0.06] text-indigo-300 group-hover:scale-105 group-hover:border-indigo-400/50 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-500/25"
          }`}
        >
          {Icon ? <Icon className="h-6 w-6 transition-transform group-hover:scale-110" /> : <Code className="h-6 w-6" />}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {categoryLabel && (
            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 group-hover:text-indigo-200 group-hover:border-indigo-400/30 transition-colors">
              {categoryLabel}
            </span>
          )}

          {selected ? (
            <span className="flex items-center gap-1 rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              <Check className="h-3 w-3 stroke-[3]" />
              <span>Selected</span>
            </span>
          ) : (
            <div className="grid h-6 w-6 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-slate-400 group-hover:border-indigo-400/50 group-hover:text-indigo-300 transition-colors">
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* Middle: Title & Description */}
      <div className="my-3">
        <h3 className="font-display text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-indigo-200 transition-colors">
          {title}
        </h3>
        <p className="mt-1.5 text-xs text-slate-300/80 leading-relaxed line-clamp-2 group-hover:text-slate-200 transition-colors">
          {description || subtitle || "Evaluated against primary domain competencies and real problem solving."}
        </p>
      </div>

      {/* Bottom Footer Indicator */}
      <div className="flex items-center justify-between border-t border-white/[0.07] pt-2.5 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-indigo-400/90 group-hover:text-indigo-300 font-medium">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          AI Adaptive Probing
        </span>
        <span className="font-semibold text-slate-400 group-hover:text-white transition-colors">
          {selected ? "Active Choice" : "Select Role"}
        </span>
      </div>
    </motion.button>
  );
}

/**
 * Reusable Compact Option Card with Hover Tooltip + Arrow Indicator
 */
function CompactOptionCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  detail,
  selected,
  onClick,
  accent = "indigo",
}) {
  return (
    <div className="group relative">
      {/* Floating Hover Tooltip with Speech Arrow */}
      {detail && (
        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2.5 w-64 -translate-x-1/2 opacity-0 scale-95 transition-all duration-150 group-hover:opacity-100 group-hover:scale-100">
          <div className="relative rounded-xl border border-white/20 bg-[#0c1022]/95 px-3.5 py-2.5 text-xs text-slate-200 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-1.5 font-bold text-white mb-1">
              <span>{title}</span>
              {badge && <span className="text-[10px] text-indigo-300 font-semibold">({badge})</span>}
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">{detail}</p>
            {/* Tooltip downward pointer arrow */}
            <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-4 border-transparent border-t-[#0c1022]/95" />
          </div>
        </div>
      )}

      {/* The Compact Interactive Card */}
      <button
        type="button"
        onClick={onClick}
        className={`w-full flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left backdrop-blur-md transition-all duration-150 cursor-pointer ${
          selected
            ? accent === "emerald"
              ? "border-emerald-500 bg-emerald-950/40 shadow-[0_0_25px_-5px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/80"
              : accent === "rose"
              ? "border-rose-500 bg-rose-950/40 shadow-[0_0_25px_-5px_rgba(244,63,94,0.35)] ring-2 ring-rose-500/80"
              : "border-indigo-500 bg-indigo-950/40 shadow-[0_0_25px_-5px_rgba(99,102,241,0.35)] ring-2 ring-indigo-500/80"
            : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-indigo-400/50 hover:shadow-md"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div
              className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border transition-colors ${
                selected
                  ? accent === "emerald"
                    ? "border-emerald-400/40 bg-emerald-600 text-white"
                    : accent === "rose"
                    ? "border-rose-400/40 bg-rose-600 text-white"
                    : "border-indigo-400/40 bg-indigo-600 text-white"
                  : "border-white/10 bg-white/[0.06] text-indigo-300 group-hover:text-white group-hover:border-indigo-400/30"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-white truncate group-hover:text-indigo-200 transition-colors">
                {title}
              </span>
              {badge && (
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-1.5 py-0.2 text-[10px] font-semibold text-slate-300 flex-shrink-0">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] text-slate-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Arrow / Selection Checkmark */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {selected ? (
            <span className="grid h-5 w-5 place-items-center rounded-full bg-indigo-500 text-white shadow-sm">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
          ) : (
            <div className="flex items-center gap-1 text-[11px] text-slate-500 group-hover:text-indigo-300 transition-colors">
              <span className="hidden xl:inline text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Info</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

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

  // Role search & category filter
  const [roleSearch, setRoleSearch] = useState("");
  const [roleCategory, setRoleCategory] = useState("all");

  const [config, setConfig] = useState({
    role_id: 1, // Default Software Developer
    company_id: null,
    resume_id: null,
    experience_level: "fresher",
    difficulty: "medium",
    interview_type: "technical",
    planned_questions: 6,
  });

  useEffect(() => {
    catalogService.roles().then((backendRoles) => {
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

  // Direct resume upload
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
      setError(getApiErrorMessage(err, "Failed to upload resume. Please choose a PDF or DOCX file."));
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

  // Filtered roles
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

  const selectedRole = roles.find((r) => r.id === config.role_id);
  const selectedCompany = companies.find((c) => c.id === config.company_id);

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#060813] via-[#0d1329] to-[#150f2e] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Ambient gradient lights */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-40 h-[520px] w-[520px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 h-[520px] w-[520px] rounded-full bg-emerald-600/10 blur-[130px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] opacity-35" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-8 py-5 sm:py-7">
        {/* Top Minimal Navigation Bar */}
        <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Dashboard</span>
          </button>

          {/* Simple Clean Step Pill */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-indigo-400" />
            Step {screenIdx + 1} of {SCREENS.length} · {stepMeta.badge}
          </span>

          {/* Current Selection summary */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400 truncate max-w-[280px]">
            <span className="text-white font-semibold truncate">{selectedRole?.name || "Select Role"}</span>
            {selectedCompany && <span className="truncate">· {selectedCompany.name}</span>}
          </div>
        </header>

        {/* Step Title Header */}
        <div className="mt-5 mb-4 sm:mt-7 sm:mb-5">
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {stepMeta.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            {stepMeta.subtitle}
          </p>
        </div>

        {/* Dynamic Compact Selection Cards (Utilizing the whole page, no inner card wrapper) */}
        <div className="flex-1 pb-24">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full"
            >
              {/* SCREEN 1: ROLES */}
              {screen === "role" && (
                <div className="space-y-4">
                  {/* Search and Category Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                        placeholder="Search roles (e.g. Full Stack, AI, Product)..."
                        className="w-full rounded-xl border border-white/10 bg-white/[0.05] pl-9 pr-8 py-2 text-xs text-white placeholder-slate-400 backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {roleSearch && (
                        <button
                          onClick={() => setRoleSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: "all", label: "All" },
                        { id: "technical", label: "Engineering" },
                        { id: "data", label: "Data & AI" },
                        { id: "product", label: "Product" },
                        { id: "business", label: "Business" },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setRoleCategory(cat.id)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                            roleCategory === cat.id
                              ? "bg-indigo-600 text-white shadow-sm"
                              : "border border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Spacious Role Cards Grid (No internal scroll) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {filteredRoles.map((r) => {
                      const IconComp = ROLE_ICONS[r.icon] || Code;
                      return (
                        <RoleOptionCard
                          key={r.id}
                          icon={IconComp}
                          title={r.name}
                          subtitle={r.categoryLabel || "Role"}
                          categoryLabel={r.categoryLabel || "Technical"}
                          description={r.description || "Evaluated against primary domain competencies and real problem solving."}
                          selected={config.role_id === r.id}
                          onClick={() => setConfig({ ...config, role_id: r.id })}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SCREEN 2: TARGET COMPANY */}
              {screen === "company" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* General / Neutral Option Card */}
                  <CompactOptionCard
                    icon={Globe}
                    title="General Practice"
                    subtitle="Industry benchmark"
                    badge="Recommended"
                    detail="Evaluates your skills against standard industry hiring bars without company-specific bias."
                    selected={config.company_id === null}
                    onClick={() => setConfig({ ...config, company_id: null })}
                  />

                  {/* Specific Company Cards */}
                  {companies.map((c) => (
                    <CompactOptionCard
                      key={c.id}
                      icon={Building2}
                      title={c.name}
                      subtitle="Company simulation"
                      detail={`Simulates the authentic question style, cultural expectations, and technical pacing known for ${c.name}.`}
                      selected={config.company_id === c.id}
                      onClick={() => setConfig({ ...config, company_id: config.company_id === c.id ? null : c.id })}
                    />
                  ))}
                </div>
              )}

              {/* SCREEN 3: RESUME */}
              {screen === "resume" && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf,.docx"
                    className="hidden"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Without Resume */}
                    <CompactOptionCard
                      icon={Zap}
                      title="Practice Without Resume"
                      subtitle="Dynamic AI generation"
                      badge="Fastest"
                      detail="Generates balanced questions calibrated strictly to your selected role and seniority level."
                      selected={config.resume_id === null}
                      onClick={() => setConfig({ ...config, resume_id: null })}
                    />

                    {/* Uploaded Resumes */}
                    {resumes.map((r) => (
                      <CompactOptionCard
                        key={r.id}
                        icon={FileText}
                        title={r.original_filename}
                        subtitle={`Uploaded ${new Date(r.created_at).toLocaleDateString()}`}
                        badge="Parsed"
                        detail="AI personalizes interview questions based on your parsed work experience, tech stack, and projects."
                        selected={config.resume_id === r.id}
                        onClick={() => setConfig({ ...config, resume_id: config.resume_id === r.id ? null : r.id })}
                      />
                    ))}

                    {/* Upload New Resume */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-3.5 py-3 text-left backdrop-blur-md transition-all hover:border-indigo-400/60 hover:bg-white/[0.06] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-indigo-400">
                          {uploadingResume ? <Spinner /> : <UploadCloud className="h-4 w-4" />}
                        </div>
                        <div>
                          <span className="font-display text-sm font-bold text-white">
                            {uploadingResume ? "Uploading..." : "Upload New Resume"}
                          </span>
                          <p className="text-[11px] text-slate-400">PDF or DOCX (Max 5MB)</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              )}

              {/* SCREEN 4: EXPERIENCE LEVEL */}
              {screen === "experience" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {EXPERIENCE_CARDS.map((opt) => (
                    <CompactOptionCard
                      key={opt.value}
                      icon={opt.icon}
                      title={opt.label}
                      subtitle={opt.subtitle}
                      badge={opt.badge}
                      detail={opt.description}
                      selected={config.experience_level === opt.value}
                      onClick={() => setConfig({ ...config, experience_level: opt.value })}
                    />
                  ))}
                </div>
              )}

              {/* SCREEN 5: DIFFICULTY */}
              {screen === "difficulty" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {DIFFICULTY_CARDS.map((opt) => (
                    <CompactOptionCard
                      key={opt.value}
                      title={opt.label}
                      subtitle={opt.subtitle}
                      badge={opt.badge}
                      accent={opt.accent}
                      detail={opt.description}
                      selected={config.difficulty === opt.value}
                      onClick={() => setConfig({ ...config, difficulty: opt.value })}
                    />
                  ))}
                </div>
              )}

              {/* SCREEN 6: INTERVIEW TYPE */}
              {screen === "type" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {TYPE_CARDS.map((opt) => (
                    <CompactOptionCard
                      key={opt.value}
                      icon={opt.icon}
                      title={opt.label}
                      subtitle={opt.subtitle}
                      badge={opt.badge}
                      detail={opt.description}
                      selected={config.interview_type === opt.value}
                      onClick={() => setConfig({ ...config, interview_type: opt.value })}
                    />
                  ))}
                </div>
              )}

              {/* SCREEN 7: DURATION / QUESTIONS */}
              {screen === "duration" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {DURATION_CARDS.map((opt) => (
                      <CompactOptionCard
                        key={opt.value}
                        icon={opt.icon}
                        title={opt.label}
                        subtitle={opt.subtitle}
                        badge={opt.badge}
                        detail={opt.description}
                        selected={config.planned_questions === opt.value}
                        onClick={() => setConfig({ ...config, planned_questions: opt.value })}
                      />
                    ))}
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Sleek Bottom Action Bar */}
      <footer className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080c1a]/95 px-4 sm:px-8 py-3.5 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <button
            onClick={goBack}
            disabled={screenIdx === 0}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              screenIdx === 0
                ? "cursor-not-allowed opacity-30 text-slate-500"
                : "border border-white/10 bg-white/[0.05] text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          {/* Center Summary Indicator */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-white font-semibold">{selectedRole?.name}</span>
            <span>·</span>
            <span>{selectedCompany?.name || "General Practice"}</span>
            <span>·</span>
            <span className="capitalize">{config.difficulty}</span>
            <span>·</span>
            <span>{config.planned_questions} Questions</span>
          </div>

          <div className="flex items-center gap-2">
            {["company", "resume"].includes(screen) && (
              <button
                onClick={goNext}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-transparent px-3 py-2 text-xs font-semibold text-slate-400 hover:bg-white/[0.06] hover:text-white transition-all"
              >
                <span>Skip</span>
                <SkipForward className="h-3 w-3" />
              </button>
            )}

            {screen === "duration" ? (
              <button
                onClick={startInterview}
                disabled={starting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:shadow-indigo-600/50 disabled:opacity-50"
              >
                {starting ? (
                  <>
                    <Spinner />
                    <span>Preparing Interview...</span>
                  </>
                ) : (
                  <>
                    <span>Start Interview</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canProceed}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100"
              >
                <span>Next</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
