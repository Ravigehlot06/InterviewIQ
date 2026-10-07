import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward, Code, BarChart3, Brain, Cpu, Globe, Smartphone, Building2 } from "lucide-react";
import { catalogService, resumeService, interviewService } from "../services";
import { getApiErrorMessage } from "../services/api";
import Button from "../components/ui/Button";
import { Spinner } from "../components/ui/Primitives";

const ICONS = { Code, BarChart3, Brain, Cpu, Globe, Smartphone };

const EXPERIENCE_OPTIONS = [
  { value: "fresher", label: "Fresher" }, { value: "0-2", label: "0-2 years" },
  { value: "2-5", label: "2-5 years" }, { value: "5+", label: "5+ years" },
];
const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" }, { value: "medium", label: "Medium" }, { value: "hard", label: "Hard" },
];
const TYPE_OPTIONS = [
  { value: "hr", label: "HR" }, { value: "technical", label: "Technical" },
  { value: "role_based", label: "Role-Based" }, { value: "company", label: "Target Company" },
];
const SCREENS = ["role", "company", "resume", "experience", "difficulty", "type", "duration"];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [screenIdx, setScreenIdx] = useState(0);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const [config, setConfig] = useState({
    role_id: null, company_id: null, resume_id: null,
    experience_level: "fresher", difficulty: "medium", interview_type: "hr", planned_questions: 6,
  });

  useEffect(() => {
    catalogService.roles().then(setRoles);
    catalogService.companies().then(setCompanies);
    resumeService.list().then(setResumes).catch(() => {});
  }, []);

  const screen = SCREENS[screenIdx];
  const goNext = () => setScreenIdx((i) => Math.min(i + 1, SCREENS.length - 1));
  const goBack = () => setScreenIdx((i) => Math.max(i - 1, 0));
  const canProceed = { role: !!config.role_id, company: true, resume: true, experience: true, difficulty: true, type: true, duration: true }[screen];

  const summary = useMemo(() => {
    const parts = [];
    const role = roles.find((r) => r.id === config.role_id);
    if (role) parts.push(role.name);
    const company = companies.find((c) => c.id === config.company_id);
    if (company) parts.push(company.name);
    if (config.resume_id) parts.push("Resume attached");
    if (screenIdx >= 4) parts.push(DIFFICULTY_OPTIONS.find((d) => d.value === config.difficulty)?.label);
    return parts;
  }, [config, roles, companies, screenIdx]);

  const startInterview = async () => {
    setStarting(true);
    setError("");
    try {
      const result = await interviewService.create(config);
      navigate(`/interview/${result.interview.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not start the interview."));
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-transparent px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex gap-1.5">
          {SCREENS.map((s, idx) => (
            <span key={s} className={`well h-1.5 flex-1 rounded-full ${idx <= screenIdx ? "bg-gradient-to-r from-emerald to-orange" : ""}`} />
          ))}
        </div>

        {summary.length > 0 && <p className="mb-6 text-sm text-ink-soft">{summary.filter(Boolean).join(" · ")}</p>}

        <AnimatePresence mode="wait">
          <motion.div key={screen} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="card p-8">
            {screen === "role" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">What role are you preparing for?</h1>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {roles.map((role) => {
                    const Icon = ICONS[role.icon] || Code;
                    const active = config.role_id === role.id;
                    return (
                      <button key={role.id} onClick={() => setConfig({ ...config, role_id: role.id })}
                        className={`flex flex-col items-start gap-2 rounded-2xl px-4 py-4 text-left transition-all ${active ? "well" : "card-soft"}`}>
                        <Icon className="h-5 w-5 text-emerald" strokeWidth={1.6} />
                        <span className="text-sm text-ink">{role.name}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {screen === "company" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Do you have a target company?</h1>
                <p className="mt-1.5 text-sm text-ink-soft">Optional — simulated practice, not official material.</p>
                <div className="mt-6 flex flex-col gap-2">
                  {companies.map((c) => (
                    <button key={c.id} onClick={() => setConfig({ ...config, company_id: config.company_id === c.id ? null : c.id })}
                      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all ${config.company_id === c.id ? "well" : "card-soft"}`}>
                      <Building2 className="h-4 w-4 text-orange" />
                      <span className="text-sm text-ink">{c.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {screen === "resume" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Use a resume for this interview?</h1>
                <p className="mt-1.5 text-sm text-ink-soft">Optional — personalizes questions to your background.</p>
                <div className="mt-6 flex flex-col gap-2">
                  {resumes.length === 0 && <p className="text-sm text-ink-faint">No resumes uploaded yet. You can skip this step.</p>}
                  {resumes.map((r) => (
                    <button key={r.id} onClick={() => setConfig({ ...config, resume_id: config.resume_id === r.id ? null : r.id })}
                      className={`rounded-2xl px-4 py-3 text-left text-sm transition-all ${config.resume_id === r.id ? "well text-ink" : "card-soft text-ink-soft"}`}>
                      {r.original_filename}
                    </button>
                  ))}
                </div>
              </>
            )}

            {screen === "experience" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Your experience level</h1>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {EXPERIENCE_OPTIONS.map((opt) => <OptionButton key={opt.value} active={config.experience_level === opt.value} label={opt.label} onClick={() => setConfig({ ...config, experience_level: opt.value })} />)}
                </div>
              </>
            )}

            {screen === "difficulty" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Choose difficulty</h1>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {DIFFICULTY_OPTIONS.map((opt) => <OptionButton key={opt.value} active={config.difficulty === opt.value} label={opt.label} onClick={() => setConfig({ ...config, difficulty: opt.value })} />)}
                </div>
              </>
            )}

            {screen === "type" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">Interview type</h1>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {TYPE_OPTIONS.map((opt) => <OptionButton key={opt.value} active={config.interview_type === opt.value} label={opt.label} onClick={() => setConfig({ ...config, interview_type: opt.value })} />)}
                </div>
              </>
            )}

            {screen === "duration" && (
              <>
                <h1 className="font-display text-xl font-semibold text-ink">How many questions?</h1>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[4, 6, 8].map((n) => <OptionButton key={n} active={config.planned_questions === n} label={`${n} questions`} onClick={() => setConfig({ ...config, planned_questions: n })} />)}
                </div>
                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
              </>
            )}

            <div className="mt-9 flex justify-between">
              <Button variant="ghost" onClick={goBack} disabled={screenIdx === 0}><ArrowLeft className="h-4 w-4" /> Back</Button>
              <div className="flex gap-2">
                {["company", "resume"].includes(screen) && <Button variant="ghost" onClick={goNext}><SkipForward className="h-4 w-4" /> Skip</Button>}
                {screen === "duration" ? (
                  <Button onClick={startInterview} disabled={starting}>{starting ? <Spinner /> : "Start interview"}</Button>
                ) : (
                  <Button onClick={goNext} disabled={!canProceed}>Continue <ArrowRight className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OptionButton({ active, label, onClick }) {
  return (
    <button onClick={onClick} className={`rounded-2xl px-4 py-3 text-sm transition-all ${active ? "well text-ink font-medium" : "card-soft text-ink-soft"}`}>
      {label}
    </button>
  );
}
