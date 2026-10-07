import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Zap } from "lucide-react";

export default function NextActionCard({ recommendation }) {
  const {
    title = "Sharpen Technical Responses",
    reason = "Your technical performance is 6% lower than communication.",
    action_label = "Practice Technical Interview",
  } = recommendation || {};

  return (
    <div className="card-saas relative overflow-hidden p-6">
      {/* Decorative ambient gradient backdrop */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-indigo-500/10 blur-2xl" />

      <div className="relative flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              Recommended Next Step
            </span>
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600">
              <Zap className="h-3.5 w-3.5" />
            </span>
          </div>

          <h3 className="mt-3 font-display text-lg font-bold text-slate-900">
            {title}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {reason}
          </p>
        </div>

        <div className="mt-5 pt-2">
          <Link
            to="/interview/setup"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-600 hover:shadow-indigo-600/20 active:scale-[0.99]"
          >
            <span>{action_label}</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
