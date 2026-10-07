import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Code2,
  Building2,
  UserCheck,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Filter,
} from "lucide-react";
import { formatDateKey } from "./dashboardData";

const CATEGORY_ICONS = {
  technical: Code2,
  company: Building2,
  hr: UserCheck,
  role_based: Code2,
  review: BarChart3,
};

export default function UpcomingEvents({
  allEvents = [],
  selectedDate,
  onResetFilter,
}) {
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;

  // Filter events if a specific date was selected
  const filteredEvents = selectedKey
    ? allEvents.filter((e) => e.dateKey === selectedKey)
    : allEvents;

  const displayCount = filteredEvents.length;
  const isFiltered = !!selectedKey && filteredEvents.length !== allEvents.length;

  return (
    <div className="card-saas-dark flex flex-col justify-between p-6">
      <div>
        {/* Card Header with count & filter clear */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-indigo-500/20 text-indigo-400">
                <Calendar className="h-4 w-4" />
              </span>
              <h2 className="font-display text-lg font-bold text-white">
                Upcoming Events
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-400">
              {isFiltered
                ? `Events for ${selectedDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "Schedule for the next 15 days"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-300">
              {displayCount} {displayCount === 1 ? "Event" : "Events"}
            </span>

            {isFiltered && (
              <button
                type="button"
                onClick={onResetFilter}
                className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                title="View all 15-day events"
              >
                <Filter className="h-3 w-3" />
                <span>Show all</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Events List */}
        <div className="mt-5 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredEvents.length > 0 ? (
              filteredEvents.slice(0, 5).map((evt, idx) => {
                const IconComponent = CATEGORY_ICONS[evt.category] || Code2;
                const isReady = evt.status === "ready";

                return (
                  <motion.div
                    key={evt.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35, delay: idx * 0.06 }}
                    className="group relative flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.04] p-3.5 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.08]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Left Icon Badge */}
                      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                        <IconComponent className="h-5 w-5" strokeWidth={1.8} />
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">
                            {evt.title}
                          </p>
                          {isReady && (
                            <span className="flex-shrink-0 rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                              Ready
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                          <span className="text-indigo-300 font-medium">
                            {evt.displayDay}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-500" />
                            {evt.time}
                          </span>
                          <span>·</span>
                          <span className="truncate max-w-[120px]">
                            {evt.role} {evt.company ? `(${evt.company})` : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action link */}
                    <Link
                      to="/interview/setup"
                      className="flex-shrink-0 grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm"
                      title="Prepare for this session"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] py-8 text-center"
              >
                <CheckCircle2 className="h-7 w-7 text-slate-500" />
                <p className="mt-2 text-sm font-medium text-slate-300">
                  No events on this date
                </p>
                <p className="text-xs text-slate-500">
                  Pick another date or explore the 15-day roadmap.
                </p>
                <button
                  type="button"
                  onClick={onResetFilter}
                  className="mt-3 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  View all upcoming sessions
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="mt-5 border-t border-white/10 pt-3">
        <Link
          to="/interview/setup"
          className="flex items-center justify-between text-xs font-semibold text-indigo-300 hover:text-white transition-colors"
        >
          <span>Schedule custom mock interview</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
