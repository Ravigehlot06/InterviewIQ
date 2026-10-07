import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { dashboardService } from "../services";
import { useAuth } from "../context/AuthContext";
import { getAvatar } from "../utils/avatar";

// Modular Dashboard Components
import DashboardHeader from "../components/dashboard/DashboardHeader";
import QuickStats from "../components/dashboard/QuickStats";
import PerformanceChart from "../components/dashboard/PerformanceChart";
import ReadinessCard from "../components/dashboard/ReadinessCard";
import PracticeRoles from "../components/dashboard/PracticeRoles";
import InterviewBreakdown from "../components/dashboard/InterviewBreakdown";
import InterviewCalendar from "../components/dashboard/InterviewCalendar";
import ScheduledEvents from "../components/dashboard/ScheduledEvents";
import NextActionCard from "../components/dashboard/NextActionCard";
import RecentInterviews from "../components/dashboard/RecentInterviews";
import { normalizeDashboardData } from "../components/dashboard/dashboardData";
import { formatDateKey } from "../components/dashboard/dashboardData";

const SCHEDULE_STORAGE_KEY = "iq_scheduled_events";

function loadScheduledEvents() {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScheduledEvents(events) {
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(events));
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState(getAvatar());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);

  // User-created scheduled events stored in localStorage
  const [scheduledEvents, setScheduledEvents] = useState(loadScheduledEvents);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      dashboardService.get().catch(() => null),
      dashboardService.history().catch(() => []),
    ])
      .then(([dashData, historyData]) => {
        if (!isMounted) return;
        const merged = dashData ? { ...dashData } : {};
        if (historyData && historyData.length > 0 && !merged.recent_interviews?.length) {
          merged.recent_interviews = historyData.slice(0, 5);
        }
        setData(merged);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const onFocus = () => setAvatar(getAvatar());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const normalized = useMemo(
    () => normalizeDashboardData(data, user),
    [data, user]
  );

  // Add a new user-scheduled event
  const handleAddEvent = (newEvent) => {
    const withMeta = {
      ...newEvent,
      id: `user-${Date.now()}`,
      dateKey: formatDateKey(new Date(newEvent.date)),
    };
    const updated = [...scheduledEvents, withMeta];
    setScheduledEvents(updated);
    saveScheduledEvents(updated);
    window.dispatchEvent(new Event("iq_schedule_updated"));
  };

  // Remove a user-scheduled event
  const handleDeleteEvent = (eventId) => {
    const updated = scheduledEvents.filter((e) => e.id !== eventId);
    setScheduledEvents(updated);
    saveScheduledEvents(updated);
    window.dispatchEvent(new Event("iq_schedule_updated"));
  };

  if (loading) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading your InterviewIQ data...
        </p>
      </div>
    );
  }

  const hasData = normalized.interviewCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8"
    >
      {/* 1. Header */}
      <DashboardHeader
        candidateName={normalized.candidateName}
        avatarType={avatar}
      />

      {/* 2. Quick Stats — only real numbers */}
      <QuickStats stats={normalized} />

      {/* 3. Performance Chart + Readiness — only shown when data exists */}
      {hasData ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.65fr_1fr]">
          <PerformanceChart data={normalized.performanceTrend} />
          <ReadinessCard
            readinessScore={normalized.readinessScore}
            readinessLabel={normalized.readinessLabel}
            readinessSource={normalized.readinessSource}
          />
        </div>
      ) : (
        <EmptyAnalyticsPlaceholder />
      )}

      {/* 4. Role Practice + Type Breakdown + Next Action */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <PracticeRoles roles={normalized.rolePractice} />
        <InterviewBreakdown breakdown={normalized.typeBreakdown} />
        <NextActionCard recommendation={normalized.recommendation} />
      </div>

      {/* 5. Calendar + User-Scheduled Events */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_1.75fr]">
        <InterviewCalendar
          events={scheduledEvents}
          selectedDate={selectedCalendarDate}
          onSelectDate={(d) => setSelectedCalendarDate(d)}
        />
        <ScheduledEvents
          allEvents={scheduledEvents}
          selectedDate={selectedCalendarDate}
          onAddEvent={handleAddEvent}
          onDeleteEvent={handleDeleteEvent}
          onResetFilter={() => setSelectedCalendarDate(null)}
        />
      </div>

      {/* 6. Recent Practice Sessions */}
      <RecentInterviews interviews={normalized.recentInterviews} />
    </motion.div>
  );
}

function EmptyAnalyticsPlaceholder() {
  return (
    <div className="card-saas flex flex-col items-center justify-center gap-4 rounded-[26px] border border-dashed border-slate-200 bg-slate-50/50 px-8 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-500">
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-slate-900">
          No Performance Data Yet
        </h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Complete your first mock interview to unlock your Performance Overview, Readiness Score, and AI analytics.
        </p>
      </div>
      <a
        href="/interview/setup"
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
      >
        Start First Interview
      </a>
    </div>
  );
}
