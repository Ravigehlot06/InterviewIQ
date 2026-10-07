import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, History, Sparkles } from "lucide-react";
import Avatar from "../ui/Avatar";
import { getAvatar } from "../../utils/avatar";

export default function DashboardHeader({ candidateName = "Candidate", avatarType }) {
  const resolvedAvatar = avatarType || getAvatar();

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar type={resolvedAvatar} size={54} />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-sm"
            title="InterviewIQ Active Status"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              InterviewIQ AI Copilot
            </span>
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, {candidateName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Keep practicing. Your next interview could be your best one yet.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/history"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <History className="h-4 w-4 text-slate-500" />
          <span>View History</span>
        </Link>
        <Link
          to="/interview/setup"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_-8px_rgba(79,70,229,0.5)] transition-all duration-200 hover:shadow-[0_14px_30px_-8px_rgba(79,70,229,0.65)] hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <Plus className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>Start New Interview</span>
        </Link>
      </div>
    </motion.header>
  );
}
