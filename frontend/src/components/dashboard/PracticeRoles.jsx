import { motion } from "framer-motion";
import { Briefcase, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function PracticeRoles({ roles = [] }) {
  return (
    <div className="card-saas flex flex-col justify-between p-6">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">
              Your Practice
            </h2>
          </div>
          <Link
            to="/interview/setup"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition-colors hover:text-indigo-800"
          >
            <span>Practice New Role</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          Roles practiced and mastery distribution.
        </p>

        {/* Roles List with Animated Progress Bars */}
        <div className="mt-5 flex flex-col gap-4">
          {roles.map((item, idx) => (
            <div key={item.role || idx} className="group">
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2">
                  <div className="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600">
                    <Briefcase className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px] sm:max-w-[200px]">
                    {item.role}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {item.interviews} {item.interviews === 1 ? "Session" : "Sessions"}
                  </span>
                  <span className="w-9 text-right font-bold text-slate-900">
                    {item.score}%
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 0.9, delay: 0.15 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        Aim for 80%+ across key target roles to maximize interview readiness.
      </div>
    </div>
  );
}
