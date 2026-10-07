import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { reportService } from "../services";
import { Spinner, Badge } from "../components/ui/Primitives";
import Button from "../components/ui/Button";
import ProgressRing from "../components/ui/ProgressRing";

const METRIC_LABELS = {
  technical_score: "Technical",
  communication_score: "Communication",
  problem_solving_score: "Problem solving",
  answer_quality_score: "Answer quality",
};

export default function Report() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reportService.get(id).then(setReport).catch(() => setError("This report is not available yet.")).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }
  if (error || !report) return <p className="text-ink-soft">{error}</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card flex flex-wrap items-center gap-8 p-8">
        <ProgressRing value={report.overall_score} size={140} strokeWidth={12} label="Overall score" />
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Interview complete</span>
          <p className="mt-1 text-sm text-ink-soft">
            {report.interview?.role?.name} · {report.interview?.interview_type}
            {report.interview?.company ? ` · ${report.interview.company.name}` : ""}
          </p>
          <p className="mt-3 font-display text-xl font-semibold text-ink">{report.readiness_label}</p>
        </div>
      </motion.div>

      <div className="card mt-6 grid gap-5 p-7 sm:grid-cols-2">
        {Object.entries(METRIC_LABELS).map(([key, label]) => (
          <div key={key}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-soft">{label}</span>
              <span className="text-sm font-medium text-ink">{Math.round(report[key] || 0)}%</span>
            </div>
            <div className="well mt-2 h-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald to-orange" style={{ width: `${report[key] || 0}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="card p-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">What you did well</span>
          <ul className="mt-3 flex flex-col gap-2">
            {report.strengths?.map((s) => <li key={s} className="text-sm text-ink-soft">— {s}</li>)}
          </ul>
        </div>
        <div className="card p-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">What to improve</span>
          <ul className="mt-3 flex flex-col gap-2">
            {report.areas_to_improve?.map((s) => <li key={s} className="text-sm text-ink-soft">— {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="card mt-6 p-7">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">AI feedback</span>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{report.ai_feedback_summary}</p>
      </div>

      <div className="card mt-6 p-7">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Your next practice</span>
          <Badge tone={report.readiness_source === "ml" ? "accent" : "demo"}>
            {report.readiness_source === "ml" ? "ML estimate" : "Fallback estimate"}
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {report.recommended_practice_areas?.length
            ? `Focus on ${report.recommended_practice_areas.join(" and ")} in your next practice.`
            : "Keep practicing regularly to build consistency across all areas."}
        </p>
        <p className="mt-2 text-xs text-ink-faint">
          This is a practice readiness estimate based on your interview performance — not a measure of employability.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button as={Link} to="/interview/setup">Practice again <ArrowRight className="h-4 w-4" /></Button>
          <Button as={Link} to="/history" variant="secondary">View history</Button>
        </div>
      </div>
    </div>
  );
}
