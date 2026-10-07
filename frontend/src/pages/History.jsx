import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon } from "lucide-react";
import { dashboardService } from "../services";
import { EmptyState, Spinner, Badge } from "../components/ui/Primitives";
import Button from "../components/ui/Button";

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.history().then(setInterviews).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-[24px] font-semibold text-ink">Interview history</h1>
      <p className="mt-1.5 text-sm text-ink-soft">Every practice session, in one place.</p>

      {interviews.length === 0 ? (
        <div className="mt-8">
          <EmptyState icon={HistoryIcon} title="No interviews yet" description="Your completed and in-progress interviews will show up here." action={<Button as={Link} to="/interview/setup" size="sm">Start an interview</Button>} />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-2.5">
          {interviews.map((iv) => (
            <Link key={iv.id} to={iv.status === "completed" ? `/interview/${iv.id}/report` : `/interview/${iv.id}`} className="card-soft flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm text-ink">{iv.role?.name} {iv.company ? `· ${iv.company.name}` : ""}</p>
                <p className="mt-0.5 text-xs text-ink-faint">
                  {new Date(iv.started_at).toLocaleDateString()} · {iv.interview_type} · {iv.difficulty}
                  {iv.duration_seconds ? ` · ${Math.round(iv.duration_seconds / 60)} min` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {iv.score != null && <span className="text-sm text-ink-soft">{Math.round(iv.score)}%</span>}
                {iv.readiness && <Badge tone="accent">{iv.readiness}</Badge>}
                <Badge tone={iv.status === "completed" ? "live" : "neutral"}>{iv.status.replace("_", " ")}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
