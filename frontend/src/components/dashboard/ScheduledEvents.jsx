import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarPlus,
  X,
  Clock,
  Briefcase,
  Tag,
  Trash2,
  CalendarDays,
  StickyNote,
  Play,
  Building2,
  Gauge,
  Layers,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import { formatDateKey } from "./dashboardData";
import { catalogService, interviewService } from "../../services";

const INTERVIEW_TYPES = [
  { value: "technical", label: "Technical" },
  { value: "hr", label: "HR / Behavioral" },
  { value: "role_based", label: "Role-Based" },
  { value: "company", label: "Company Specific" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const EXPERIENCE_OPTIONS = [
  { value: "fresher", label: "Fresher" },
  { value: "0-2", label: "0–2 Years" },
  { value: "2-5", label: "2–5 Years" },
  { value: "5+", label: "5+ Years" },
];

const QUESTION_COUNT_OPTIONS = [
  { value: 3, label: "3 Questions (Quick)" },
  { value: 6, label: "6 Questions (Standard)" },
  { value: 9, label: "9 Questions (Deep Dive)" },
];

const TYPE_COLORS = {
  technical: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", border: "border-indigo-200" },
  hr: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-200" },
  role_based: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  company: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
};

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ScheduledEvents({
  allEvents = [],
  selectedDate,
  onAddEvent,
  onDeleteEvent,
  onResetFilter,
}) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [launchingId, setLaunchingId] = useState(null);
  const [startError, setStartError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state containing all interview configuration options (except resume)
  const [form, setForm] = useState({
    title: "",
    date: getToday(),
    time: "10:00",
    role_id: "",
    company_id: "",
    interview_type: "technical",
    difficulty: "medium",
    experience_level: "fresher",
    planned_questions: 6,
    note: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch catalog roles & companies
  useEffect(() => {
    catalogService.roles().then((r) => {
      setRoles(r || []);
      if (r && r.length > 0 && !form.role_id) {
        setForm((prev) => ({
          ...prev,
          role_id: r[0].id,
          title: prev.title || `${r[0].name} Technical Mock`,
        }));
      }
    }).catch(() => {});

    catalogService.companies().then((c) => {
      setCompanies(c || []);
    }).catch(() => {});
  }, []);

  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
  const todayKey = formatDateKey(new Date());

  // Filter and sort events
  const displayedEvents = useMemo(() => {
    const sorted = [...allEvents].sort(
      (a, b) => new Date(a.date + "T" + (a.time || "00:00")) - new Date(b.date + "T" + (b.time || "00:00"))
    );
    if (selectedKey) {
      return sorted.filter((e) => e.dateKey === selectedKey);
    }
    return sorted.filter((e) => e.dateKey >= todayKey);
  }, [allEvents, selectedKey, todayKey]);

  // Check if scheduled time is matched (today and time has reached / within 15 min before)
  const isTimeMatched = (ev) => {
    if (!ev?.date) return false;
    const today = getToday();
    if (ev.date !== today) return false;
    if (!ev.time) return true;

    const now = new Date();
    const [hours, minutes] = ev.time.split(":").map(Number);
    const eventTime = new Date();
    eventTime.setHours(hours, minutes, 0, 0);

    const diffMins = (now.getTime() - eventTime.getTime()) / (1000 * 60);
    // Matched if current time is within 15 minutes before or anytime after scheduled time today
    return diffMins >= -15;
  };

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Session title is required.";
    if (!form.date) errs.date = "Date is required.";
    if (!form.time) errs.time = "Time is required.";
    if (!form.role_id) errs.role_id = "Please select a target role.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedRole = roles.find((r) => String(r.id) === String(form.role_id));
    const selectedCompany = companies.find((c) => String(c.id) === String(form.company_id));

    onAddEvent({
      title: form.title.trim(),
      date: form.date,
      time: form.time,
      role_id: Number(form.role_id) || form.role_id,
      role_name: selectedRole?.name || "Target Role",
      company_id: form.company_id ? (Number(form.company_id) || form.company_id) : null,
      company_name: selectedCompany?.name || null,
      interview_type: form.interview_type,
      type: form.interview_type,
      difficulty: form.difficulty,
      experience_level: form.experience_level,
      planned_questions: Number(form.planned_questions) || 6,
      role: selectedRole?.name || "Target Role",
      note: form.note.trim() || null,
      dateKey: form.date,
    });

    // Notify listeners (e.g. NotificationBell)
    window.dispatchEvent(new Event("iq_schedule_updated"));

    // Reset
    setForm({
      title: roles[0] ? `${roles[0].name} Technical Mock` : "",
      date: getToday(),
      time: "10:00",
      role_id: roles[0]?.id || "",
      company_id: "",
      interview_type: "technical",
      difficulty: "medium",
      experience_level: "fresher",
      planned_questions: 6,
      note: "",
    });
    setErrors({});
    setShowModal(false);
  };

  const handleClose = () => {
    setErrors({});
    setShowModal(false);
  };

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "role_id") {
        const found = roles.find((r) => String(r.id) === String(value));
        if (found && (!prev.title || prev.title.includes("Mock"))) {
          updated.title = `${found.name} ${updated.interview_type === "hr" ? "HR" : "Technical"} Mock`;
        }
      }
      return updated;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Directly start the interview from the scheduled event
  const handleStartInterview = async (ev) => {
    setLaunchingId(ev.id);
    setStartError("");

    try {
      let roleId = ev.role_id;
      if (!roleId && roles.length > 0) {
        // Try matching role by name
        const match = roles.find((r) => r.name.toLowerCase() === (ev.role || "").toLowerCase());
        roleId = match ? match.id : roles[0].id;
      }

      const payload = {
        role_id: roleId,
        company_id: ev.company_id || null,
        experience_level: ev.experience_level || "fresher",
        difficulty: ev.difficulty || "medium",
        interview_type: ev.interview_type || ev.type || "technical",
        planned_questions: ev.planned_questions || 6,
      };

      const result = await interviewService.create(payload);
      navigate(`/interview/${result.interview.id}`);
    } catch (err) {
      console.error("Failed to start scheduled interview:", err);
      setStartError("Could not start interview. Redirecting to setup...");
      setTimeout(() => {
        navigate("/interview/setup");
      }, 1200);
    } finally {
      setLaunchingId(null);
    }
  };

  const formatDisplayDate = (ev) => {
    const d = new Date(`${ev.date}T${ev.time || "00:00"}`);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const colors = (type) => TYPE_COLORS[type] || TYPE_COLORS.technical;

  return (
    <>
      <div className="card-saas flex flex-col gap-5 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                My Schedule
              </h2>
              <p className="text-xs text-slate-500">
                {selectedKey
                  ? `Events on ${selectedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                  : "Upcoming practice sessions & direct interview launcher"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedKey && (
              <button
                type="button"
                onClick={onResetFilter}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Clear filter
              </button>
            )}
            <button
              type="button"
              id="schedule-interview-btn"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <CalendarPlus className="h-3.5 w-3.5" />
              Schedule
            </button>
          </div>
        </div>

        {startError && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{startError}</span>
          </div>
        )}

        {/* Events List */}
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "360px" }}>
          <AnimatePresence initial={false}>
            {displayedEvents.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center gap-3 py-10 text-center"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <CalendarPlus className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {selectedKey ? "No sessions on this day" : "No upcoming sessions"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Click <span className="font-semibold text-indigo-600">Schedule</span> to configure and schedule your next mock interview.
                  </p>
                </div>
              </motion.div>
            ) : (
              displayedEvents.map((ev) => {
                const c = colors(ev.type || ev.interview_type);
                const matched = isTimeMatched(ev);
                const isLaunching = launchingId === ev.id;

                return (
                  <motion.div
                    key={ev.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`group relative flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                      matched
                        ? "border-emerald-300 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-200"
                        : "border-slate-100 bg-white hover:border-indigo-100 hover:shadow-md"
                    }`}
                  >
                    {/* Type Dot */}
                    <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${matched ? "bg-emerald-500 animate-pulse" : c.dot}`} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">{ev.title}</p>
                          {matched && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 animate-pulse">
                              <Clock className="h-3 w-3" /> Time Matched · Ready
                            </span>
                          )}
                        </div>
                        <span className={`flex-shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
                          {INTERVIEW_TYPES.find((t) => t.value === (ev.type || ev.interview_type))?.label || ev.type}
                        </span>
                      </div>

                      {/* Metadata tags */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="h-3 w-3 text-slate-400" />
                          {formatDisplayDate(ev)} · {ev.time}
                        </span>
                        {(ev.role || ev.role_name) && (
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            {ev.role || ev.role_name}
                          </span>
                        )}
                        {ev.company_name && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            {ev.company_name}
                          </span>
                        )}
                        {ev.difficulty && (
                          <span className="flex items-center gap-1 capitalize">
                            <Gauge className="h-3 w-3 text-slate-400" />
                            {ev.difficulty}
                          </span>
                        )}
                        {ev.planned_questions && (
                          <span className="flex items-center gap-1">
                            <HelpCircle className="h-3 w-3 text-slate-400" />
                            {ev.planned_questions} Qs
                          </span>
                        )}
                        {ev.note && (
                          <span className="flex items-center gap-1 italic text-slate-400">
                            <StickyNote className="h-3 w-3" />
                            {ev.note}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Start Interview (on hover OR always if matched) + Delete */}
                    <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                      {/* START INTERVIEW BUTTON:
                          Visible ALWAYS when time matched, or revealed ON HOVER */}
                      <button
                        type="button"
                        disabled={isLaunching}
                        onClick={() => handleStartInterview(ev)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 ${
                          matched
                            ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 opacity-0 group-hover:opacity-100 shadow-indigo-600/20"
                        }`}
                        title="Directly start this interview now"
                      >
                        {isLaunching ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Play className="h-3 w-3 fill-current" />
                            <span>Start Interview</span>
                          </>
                        )}
                      </button>

                      {/* Delete Event */}
                      {deleteConfirm === ev.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              onDeleteEvent(ev.id);
                              setDeleteConfirm(null);
                              window.dispatchEvent(new Event("iq_schedule_updated"));
                            }}
                            className="rounded-lg bg-rose-500 px-2 py-1 text-[10px] font-semibold text-white hover:bg-rose-600"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(null)}
                            className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(ev.id)}
                          className="hidden text-slate-300 hover:text-rose-500 group-hover:flex transition-colors p-1"
                          aria-label="Delete event"
                          title="Delete scheduled event"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Schedule Modal (Includes ALL options except resume) */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
          >
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="relative w-full max-w-lg rounded-[28px] bg-white p-7 shadow-2xl my-auto"
            >
              {/* Modal Header */}
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900 flex items-center gap-2">
                    <CalendarPlus className="h-5 w-5 text-indigo-600" />
                    Schedule Mock Interview
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Configure your session parameters. You can start directly when the time arrives or on hover.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="schedule-form">
                {/* Session Title */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-title">
                    Session Title *
                  </label>
                  <input
                    id="sched-title"
                    type="text"
                    placeholder="e.g. Software Developer Technical Mock"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                      errors.title ? "border-rose-400" : "border-slate-200"
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-[11px] text-rose-500">{errors.title}</p>}
                </div>

                {/* Date + Time Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-date">
                      Date *
                    </label>
                    <input
                      id="sched-date"
                      type="date"
                      value={form.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      min={getToday()}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                        errors.date ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                    {errors.date && <p className="mt-1 text-[11px] text-rose-500">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-time">
                      Time *
                    </label>
                    <input
                      id="sched-time"
                      type="time"
                      value={form.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm text-slate-900 outline-none transition-shadow focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                        errors.time ? "border-rose-400" : "border-slate-200"
                      }`}
                    />
                    {errors.time && <p className="mt-1 text-[11px] text-rose-500">{errors.time}</p>}
                  </div>
                </div>

                {/* Target Role & Target Company */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-role">
                      <Briefcase className="mb-0.5 mr-1 inline h-3 w-3 text-slate-400" />
                      Target Role *
                    </label>
                    <select
                      id="sched-role"
                      value={form.role_id}
                      onChange={(e) => handleChange("role_id", e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2 text-sm text-slate-900 outline-none bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${
                        errors.role_id ? "border-rose-400" : "border-slate-200"
                      }`}
                    >
                      <option value="" disabled>Select a role...</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    {errors.role_id && <p className="mt-1 text-[11px] text-rose-500">{errors.role_id}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-company">
                      <Building2 className="mb-0.5 mr-1 inline h-3 w-3 text-slate-400" />
                      Company <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <select
                      id="sched-company"
                      value={form.company_id}
                      onChange={(e) => handleChange("company_id", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="">None / General</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Interview Type & Difficulty Level */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-type">
                      <Tag className="mb-0.5 mr-1 inline h-3 w-3 text-slate-400" />
                      Interview Type
                    </label>
                    <select
                      id="sched-type"
                      value={form.interview_type}
                      onChange={(e) => handleChange("interview_type", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {INTERVIEW_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-difficulty">
                      <Gauge className="mb-0.5 mr-1 inline h-3 w-3 text-slate-400" />
                      Difficulty Level
                    </label>
                    <select
                      id="sched-difficulty"
                      value={form.difficulty}
                      onChange={(e) => handleChange("difficulty", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {DIFFICULTY_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Experience Level & Question Count */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-exp">
                      <Layers className="mb-0.5 mr-1 inline h-3 w-3 text-slate-400" />
                      Experience Level
                    </label>
                    <select
                      id="sched-exp"
                      value={form.experience_level}
                      onChange={(e) => handleChange("experience_level", e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {EXPERIENCE_OPTIONS.map((e) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-questions">
                      <HelpCircle className="mb-0.5 mr-1 inline h-3 w-3 text-slate-400" />
                      Planned Questions
                    </label>
                    <select
                      id="sched-questions"
                      value={form.planned_questions}
                      onChange={(e) => handleChange("planned_questions", Number(e.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    >
                      {QUESTION_COUNT_OPTIONS.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Notes (Optional) */}
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-700" htmlFor="sched-note">
                    <StickyNote className="mb-0.5 mr-1 inline h-3 w-3 text-slate-400" />
                    Focus Notes <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    id="sched-note"
                    rows={2}
                    placeholder="e.g. Focus on database indexing and system trade-offs"
                    value={form.note}
                    onChange={(e) => handleChange("note", e.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                {/* Actions */}
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Add to Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
