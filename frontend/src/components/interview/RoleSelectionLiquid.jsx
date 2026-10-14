import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Code,
  Layers,
  Layout,
  Server,
  BarChart3,
  Brain,
  Cpu,
  Cloud,
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
  HeartHandshake,
  Globe,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  X
} from "lucide-react";

const ICONS = {
  Code,
  Layers,
  Layout,
  Server,
  BarChart3,
  Brain,
  Cpu,
  Cloud,
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
  HeartHandshake,
  Globe,
};

// Comprehensive role catalog with rich descriptions and category tagging
export const DEFAULT_ROLES = [
  // Technical Roles
  {
    id: 1,
    slug: "software-developer",
    name: "Software Developer",
    category: "technical",
    categoryLabel: "Technical",
    description: "Core software engineering, algorithms, data structures & clean code principles.",
    icon: "Code",
  },
  {
    id: 2,
    slug: "fullstack-developer",
    name: "Full Stack Developer",
    category: "technical",
    categoryLabel: "Technical",
    description: "End-to-end architectures, React/Next.js frontends, APIs & database integration.",
    icon: "Layers",
  },
  {
    id: 3,
    slug: "frontend-developer",
    name: "Frontend Developer",
    category: "technical",
    categoryLabel: "Technical",
    description: "Interactive UI, responsive UX, modern web performance, CSS & state management.",
    icon: "Layout",
  },
  {
    id: 4,
    slug: "backend-developer",
    name: "Backend Developer",
    category: "technical",
    categoryLabel: "Technical",
    description: "Distributed microservices, concurrency, REST/GraphQL APIs & database performance.",
    icon: "Server",
  },
  {
    id: 5,
    slug: "data-analyst",
    name: "Data Analyst",
    category: "technical",
    categoryLabel: "Technical",
    description: "SQL querying, business metrics, visualization dashboards & statistical analysis.",
    icon: "BarChart3",
  },
  {
    id: 6,
    slug: "data-scientist",
    name: "Data Scientist",
    category: "technical",
    categoryLabel: "Technical",
    description: "Predictive modeling, machine learning pipelines & data experimentations.",
    icon: "Brain",
  },
  {
    id: 7,
    slug: "ai-ml-engineer",
    name: "AI / ML Engineer",
    category: "technical",
    categoryLabel: "Technical",
    description: "Deep learning models, LLMs, prompt engineering, PyTorch & MLOps deployment.",
    icon: "Cpu",
  },
  {
    id: 8,
    slug: "devops-engineer",
    name: "DevOps & Cloud Engineer",
    category: "technical",
    categoryLabel: "Technical",
    description: "CI/CD pipelines, Docker, Kubernetes, Terraform & AWS/GCP cloud systems.",
    icon: "Cloud",
  },
  {
    id: 9,
    slug: "mobile-developer",
    name: "Mobile App Developer",
    category: "technical",
    categoryLabel: "Technical",
    description: "iOS, Android, React Native & Flutter mobile applications.",
    icon: "Smartphone",
  },
  {
    id: 10,
    slug: "cybersecurity-analyst",
    name: "Cybersecurity Analyst",
    category: "technical",
    categoryLabel: "Technical",
    description: "Threat defense, vulnerability assessments, security compliance & incident response.",
    icon: "ShieldCheck",
  },
  {
    id: 11,
    slug: "qa-engineer",
    name: "QA & Automation Engineer",
    category: "technical",
    categoryLabel: "Technical",
    description: "Test automation frameworks, Cypress/Selenium, integration & end-to-end testing.",
    icon: "CheckCircle2",
  },
  {
    id: 12,
    slug: "systems-architect",
    name: "Systems Architect",
    category: "technical",
    categoryLabel: "Technical",
    description: "High-level enterprise architecture, scalability, reliability & system trade-offs.",
    icon: "Network",
  },
  {
    id: 21,
    slug: "web-developer",
    name: "Web Developer",
    category: "technical",
    categoryLabel: "Technical",
    description: "Modern web standards, responsive design, APIs & browser optimization.",
    icon: "Globe",
  },
  {
    id: 22,
    slug: "android-developer",
    name: "Android Developer",
    category: "technical",
    categoryLabel: "Technical",
    description: "Native Kotlin, Jetpack Compose, background tasks & Android architecture.",
    icon: "Smartphone",
  },

  // Non-Technical, Product, Management & Creative Roles
  {
    id: 13,
    slug: "product-manager",
    name: "Product Manager",
    category: "non-technical",
    categoryLabel: "Product",
    description: "Product discovery, roadmapping, user metrics & cross-functional leadership.",
    icon: "Compass",
  },
  {
    id: 14,
    slug: "ui-ux-designer",
    name: "UI / UX Designer",
    category: "non-technical",
    categoryLabel: "Design",
    description: "Design systems, Figma wireframes, user testing & intuitive workflows.",
    icon: "Palette",
  },
  {
    id: 15,
    slug: "project-manager",
    name: "Project Manager / Scrum Master",
    category: "non-technical",
    categoryLabel: "Management",
    description: "Agile sprints, milestone delivery, risk management & team alignment.",
    icon: "Kanban",
  },
  {
    id: 16,
    slug: "business-analyst",
    name: "Business Analyst",
    category: "non-technical",
    categoryLabel: "Business",
    description: "Requirements gathering, KPI tracking, workflow modeling & strategy execution.",
    icon: "LineChart",
  },
  {
    id: 17,
    slug: "hr-specialist",
    name: "HR & Talent Partner",
    category: "non-technical",
    categoryLabel: "People",
    description: "Behavioral assessment, culture building, talent acquisition & employee relations.",
    icon: "Users",
  },
  {
    id: 18,
    slug: "marketing-specialist",
    name: "Marketing & Growth",
    category: "non-technical",
    categoryLabel: "Marketing",
    description: "Growth loops, go-to-market execution, content strategy & funnel analytics.",
    icon: "Megaphone",
  },
  {
    id: 19,
    slug: "sales-executive",
    name: "Sales & Account Executive",
    category: "non-technical",
    categoryLabel: "Sales",
    description: "B2B client pitches, objection management, discovery calls & enterprise closing.",
    icon: "Briefcase",
  },
  {
    id: 20,
    slug: "customer-success",
    name: "Customer Success Lead",
    category: "non-technical",
    categoryLabel: "Success",
    description: "Account onboarding, retention metrics, customer advocacy & renewals.",
    icon: "HeartHandshake",
  },
];

export default function RoleSelectionLiquid({
  roles = [],
  selectedRoleId = null,
  onSelectRole,
  onNext,
  onPrevious,
  canGoPrevious = true,
}) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Combine backend roles with fallback catalog metadata
  const combinedRoles = useMemo(() => {
    if (!roles || roles.length === 0) return DEFAULT_ROLES;

    return roles.map((r, idx) => {
      const match = DEFAULT_ROLES.find(
        (dr) => dr.slug === r.slug || dr.name.toLowerCase() === r.name?.toLowerCase()
      );
      const isTech =
        match?.category === "technical" ||
        [
          "code",
          "barchart3",
          "brain",
          "cpu",
          "globe",
          "smartphone",
          "layers",
          "layout",
          "server",
          "cloud",
          "shieldcheck",
          "checkcircle2",
          "network",
        ].includes((r.icon || "").toLowerCase()) ||
        !match;

      return {
        id: r.id ?? match?.id ?? idx + 1,
        slug: r.slug || match?.slug || `role-${idx}`,
        name: r.name,
        category: match?.category || (isTech ? "technical" : "non-technical"),
        categoryLabel: match?.categoryLabel || (isTech ? "Technical" : "Non-Technical"),
        description:
          r.description || match?.description || "Role-specific interview questions & adaptive evaluation.",
        icon: r.icon || match?.icon || "Code",
      };
    });
  }, [roles]);

  const filteredRoles = useMemo(() => {
    return combinedRoles.filter((r) => {
      const matchesCategory =
        categoryFilter === "all" || r.category === categoryFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [combinedRoles, categoryFilter, searchQuery]);

  const selectedRole = useMemo(
    () => combinedRoles.find((r) => r.id === selectedRoleId),
    [combinedRoles, selectedRoleId]
  );

  return (
    <div className="relative w-full">
      {/* Header section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-50 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-800 shadow-xs">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Interactive Career Trajectory</span>
        </div>

        <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Choose the role you want to see yourself in the future
        </h1>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
          Select the specific target role you are preparing for. Our AI interviewer adapts question depth, technical rigor, and follow-ups accordingly.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-2.5 shadow-xs">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `All Roles (${combinedRoles.length})` },
            {
              id: "technical",
              label: `💻 Technical (${combinedRoles.filter((r) => r.category === "technical").length})`,
            },
            {
              id: "non-technical",
              label: `📊 Non-Technical (${combinedRoles.filter((r) => r.category === "non-technical").length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategoryFilter(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                categoryFilter === tab.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick search */}
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 rounded-xl border border-slate-200 bg-white pl-8 pr-7 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 w-40 sm:w-52"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 max-h-[460px] overflow-y-auto px-0.5 py-1 scrollbar-thin">
        {filteredRoles.map((role) => {
          const Icon = ICONS[role.icon] || Code;
          const isSelected = selectedRoleId === role.id;

          return (
            <motion.button
              key={role.id}
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRole(role.id)}
              className={`group relative flex flex-col items-start gap-2.5 rounded-2xl p-4 text-left transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-50/90 border-2 border-emerald-600 shadow-md shadow-emerald-700/15"
                  : "bg-white/90 border border-slate-200/90 hover:border-emerald-400 hover:bg-white hover:shadow-sm"
              }`}
            >
              {/* Top Row: Icon + Category Badge + Selected Checkmark */}
              <div className="flex w-full items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    isSelected
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-700/30"
                      : "bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
                      role.category === "technical"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {role.categoryLabel}
                  </span>

                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Role Title & Description */}
              <div className="w-full">
                <h4
                  className={`font-display text-[15px] font-bold leading-snug transition-colors ${
                    isSelected ? "text-emerald-950" : "text-slate-900 group-hover:text-emerald-900"
                  }`}
                >
                  {role.name}
                </h4>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-600">
                  {role.description}
                </p>
              </div>

              {/* Footer status text */}
              <div
                className={`mt-auto flex items-center gap-1.5 text-[11px] font-semibold transition-colors ${
                  isSelected
                    ? "text-emerald-700"
                    : "text-slate-400 group-hover:text-emerald-600"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-emerald-600" : "bg-slate-300 group-hover:bg-emerald-500"}`} />
                <span>{isSelected ? "Selected Role" : "Click to select"}</span>
              </div>
            </motion.button>
          );
        })}

        {filteredRoles.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No roles matching &quot;{searchQuery}&quot;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
              className="mt-2 text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
            >
              Clear filters and view all roles
            </button>
          </div>
        )}
      </div>

      {/* Selected Role Spotlight confirmation banner */}
      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50 px-4 py-2.5"
        >
          <div className="flex items-center gap-2 text-xs text-emerald-950 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Target role chosen: <strong>{selectedRole.name}</strong> ({selectedRole.categoryLabel})
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider hidden sm:inline">
            Ready to proceed
          </span>
        </motion.div>
      )}

      {/* Bottom Navigation */}
      <div className="mt-7 flex items-center justify-between border-t border-slate-200/80 pt-4">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all ${
            canGoPrevious
              ? "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 active:scale-95 shadow-xs"
              : "cursor-not-allowed text-slate-400 opacity-40 border border-transparent"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!selectedRoleId}
          className={`flex items-center gap-2 rounded-2xl px-6 py-2.5 text-sm font-semibold transition-all ${
            selectedRoleId
              ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-700/20 hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg active:scale-95 cursor-pointer"
              : "cursor-not-allowed bg-slate-200 text-slate-400 border border-slate-200"
          }`}
        >
          <span>Next</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
