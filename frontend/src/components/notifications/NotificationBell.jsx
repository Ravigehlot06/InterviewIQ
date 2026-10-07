import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Flame,
  RotateCcw,
  X,
  Play,
  CheckCircle2,
  BellOff,
  RefreshCw,
} from "lucide-react";
import {
  loadNotifications,
  removeNotification,
  saveNotifications,
  resetNotifications,
} from "../../utils/notificationStorage";
import { interviewService } from "../../services";

const TYPE_CONFIG = {
  schedule: {
    icon: Calendar,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    badge: "bg-indigo-100 text-indigo-700",
    tag: "Schedule",
  },
  schedule_matched: {
    icon: Clock,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800 animate-pulse",
    tag: "Time Matched",
  },
  practice: {
    icon: Flame,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    badge: "bg-amber-100 text-amber-800",
    tag: "Practice Reminder",
  },
  cadence: {
    icon: RotateCcw,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    badge: "bg-purple-100 text-purple-800",
    tag: "3-Day Cadence",
  },
  readiness: {
    icon: Sparkles,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    badge: "bg-blue-100 text-blue-800",
    tag: "Insight",
  },
};

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(loadNotifications);
  const [viewingItem, setViewingItem] = useState(null);
  const [launching, setLaunching] = useState(false);
  const dropdownRef = useRef(null);

  // Sync notifications across tabs or when schedule updates
  useEffect(() => {
    const handleSync = () => {
      setNotifications(loadNotifications());
    };
    window.addEventListener("iq_notifications_changed", handleSync);
    window.addEventListener("iq_schedule_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("iq_notifications_changed", handleSync);
      window.removeEventListener("iq_schedule_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Delete notification (Bin button)
  const handleDelete = (e, id) => {
    e.stopPropagation();
    const updated = removeNotification(id);
    setNotifications(updated);
  };

  // View notification (Eye button)
  const handleView = (e, item) => {
    e.stopPropagation();
    setViewingItem(item);
  };

  // Dismiss popup and remove notification (as requested: "if it views small pop will view the message and it will gone")
  const handleCloseViewModal = () => {
    if (viewingItem) {
      const updated = removeNotification(viewingItem.id);
      setNotifications(updated);
      setViewingItem(null);
    }
  };

  // Clear all notifications
  const handleClearAll = () => {
    saveNotifications([]);
    setNotifications([]);
  };

  // Reset demo / default notifications
  const handleReset = () => {
    const fresh = resetNotifications();
    setNotifications(fresh);
  };

  // Direct start interview from notification
  const handleStartFromNotification = async (eventData) => {
    setLaunching(true);
    try {
      const payload = {
        role_id: eventData?.role_id,
        company_id: eventData?.company_id || null,
        experience_level: eventData?.experience_level || "fresher",
        difficulty: eventData?.difficulty || "medium",
        interview_type: eventData?.interview_type || "technical",
        planned_questions: eventData?.planned_questions || 6,
      };

      // If no role_id saved on older schedule, fetch default
      if (!payload.role_id) {
        const rolesRes = await fetch("http://localhost:5000/api/roles").then((r) => r.json());
        if (rolesRes && rolesRes.length > 0) {
          payload.role_id = rolesRes[0].id;
        }
      }

      const res = await interviewService.create(payload);
      if (viewingItem) {
        removeNotification(viewingItem.id);
      }
      setViewingItem(null);
      setOpen(false);
      navigate(`/interview/${res.interview.id}`);
    } catch (err) {
      console.error("Failed to start interview from notification", err);
      // Fallback navigate to setup
      navigate("/interview/setup");
    } finally {
      setLaunching(false);
    }
  };

  const count = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className={`relative grid h-9 w-9 place-items-center rounded-xl border transition-all ${
          open
            ? "border-indigo-300 bg-indigo-50/70 text-indigo-700 shadow-sm"
            : "border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }`}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 grid min-h-4 min-w-4 px-1 place-items-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in-50">
            {count}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute right-0 top-11 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xl shadow-slate-900/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {count > 0 && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                    {count} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {count > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] font-medium text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset notifications"
                  className="grid h-6 w-6 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Notification Items List */}
            <div className="mt-2.5 flex flex-col gap-2 max-h-[380px] overflow-y-auto pr-0.5">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-400">
                    <BellOff className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                  <p className="text-[11px] text-slate-400 max-w-[200px]">
                    No new notifications right now. Add a schedule or practice session to receive alerts.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Refresh alerts
                  </button>
                </div>
              ) : (
                notifications.map((item) => {
                  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.practice;
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={item.id}
                      className="group relative flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-white hover:border-slate-200/80 hover:shadow-sm transition-all"
                    >
                      {/* Left: Type Icon & Content */}
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className={`mt-0.5 grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border ${cfg.color}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="truncate text-xs font-semibold text-slate-800">
                              {item.title}
                            </p>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider ${cfg.badge}`}
                            >
                              {cfg.tag}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                            {item.message}
                          </p>
                          <p className="mt-1 text-[10px] font-medium text-slate-400">
                            {item.time}
                          </p>
                        </div>
                      </div>

                      {/* Right: Action Buttons (Eye & Bin) */}
                      <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                        {/* Eye (View) Button */}
                        <button
                          type="button"
                          onClick={(e) => handleView(e, item)}
                          title="View message"
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>

                        {/* Bin (Delete) Button */}
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, item.id)}
                          title="Delete notification"
                          className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small View Popup Modal (Opens when Eye button is clicked, disappears when viewed/closed) */}
      <AnimatePresence>
        {viewingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) handleCloseViewModal();
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
                      {TYPE_CONFIG[viewingItem.type]?.tag || "Notification"}
                    </span>
                    <p className="mt-0.5 text-[11px] text-slate-400">{viewingItem.time}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Title & Full Message */}
              <div className="mt-4">
                <h4 className="font-display text-base font-bold text-slate-900">
                  {viewingItem.title}
                </h4>
                <div className="mt-2 rounded-xl bg-slate-50 p-3.5 border border-slate-100/80">
                  <p className="text-xs leading-relaxed text-slate-600">
                    {viewingItem.message}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-2">
                {viewingItem.eventData ? (
                  <button
                    type="button"
                    disabled={launching}
                    onClick={() => handleStartFromNotification(viewingItem.eventData)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    {launching ? (
                      <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Start Interview</span>
                      </>
                    )}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={handleCloseViewModal}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all text-center"
                >
                  Got it (Dismiss)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
