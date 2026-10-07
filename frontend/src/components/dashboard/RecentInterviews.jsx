import { Link } from "react-router-dom";
import { ArrowRight, History, CheckCircle, Clock } from "lucide-react";

export default function RecentInterviews({ interviews = [] }) {
  return (
    <div className="card-saas p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Recent Interviews
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Latest mock interview performance and detailed feedback reports.
          </p>
        </div>

        <Link
          to="/history"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <span>View All History</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {interviews.length > 0 ? (
          interviews.map((iv) => {
            const isCompleted = iv.status === "completed";
            const to = isCompleted
              ? `/interview/${iv.id}/report`
              : `/interview/${iv.id}`;

            const dateStr = iv.started_at
              ? new Date(iv.started_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Recent";

            const roleName = iv.role?.name || "Practice Session";
            const scoreVal = iv.score != null ? Math.round(iv.score) : null;

            return (
              <div
                key={iv.id}
                className="group flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 transition-all duration-150 hover:border-slate-200 hover:bg-white hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Clock className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {roleName}
                      {iv.company?.name ? ` · ${iv.company.name}` : ""}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 capitalize">
                      {iv.interview_type?.replace("_", " ") || "Mock"} ·{" "}
                      {iv.difficulty || "medium"} · {dateStr}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  {scoreVal != null && (
                    <div className="text-right">
                      <span className="font-display text-base font-bold text-slate-900">
                        {scoreVal}%
                      </span>
                      <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                        Score
                      </p>
                    </div>
                  )}

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {iv.status?.replace("_", " ")}
                  </span>

                  <Link
                    to={to}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span>{isCompleted ? "View Report" : "Resume"}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-slate-50/50 py-10 text-center">
            <History className="h-8 w-8 text-slate-400" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              No interviews completed yet
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Take your first mock interview to view analytics and AI feedback.
            </p>
            <Link
              to="/interview/setup"
              className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Start Your First Interview
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
