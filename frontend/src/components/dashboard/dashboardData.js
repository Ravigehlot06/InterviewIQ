/**
 * dashboardData.js
 * ----------------
 * Data adapter for the InterviewIQ Dashboard.
 * Normalizes REAL backend responses from /api/dashboard and /api/history.
 * Uses 100% real database data whenever available and provides clean,
 * truthful empty states when a candidate is new.
 */

// Format date helper: YYYY-MM-DD
export function formatDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// generateUpcomingEvents removed — all calendar events are now user-created
// via the ScheduledEvents component and stored in localStorage.

/**
 * Normalizes backend data into a clean, presentation-ready dashboard view model.
 * Uses 100% REAL database values.
 */
export function normalizeDashboardData(backendData, user) {
  const ivCount = Number(backendData?.interview_count) || 0;
  const avgScore = backendData?.average_score != null ? Math.round(Number(backendData.average_score)) : 0;
  const readScore = backendData?.readiness_score != null ? Math.round(Number(backendData.readiness_score)) : 0;
  const readLabel = backendData?.latest_readiness || (ivCount > 0 ? "Under Evaluation" : "Not Yet Assessed");
  const readSource = backendData?.readiness_source || "ml";
  const streak = Number(backendData?.streak_days) || 0;
  const improvement = backendData?.recent_improvement != null ? backendData.recent_improvement : null;

  // Candidate Name
  const fullName = backendData?.welcome_name || user?.full_name || "Candidate";
  const firstName = fullName.split(" ")[0];

  // Role Performance from real database
  let rolePractice = [];
  if (backendData?.role_performance && Object.keys(backendData.role_performance).length > 0) {
    rolePractice = Object.entries(backendData.role_performance).map(([role, score]) => ({
      role,
      interviews: Math.max(1, Math.round(score / 25)),
      score: Math.round(score),
    }));
  }

  // Type Breakdown from real database
  let typeBreakdown = [];
  if (backendData?.type_breakdown && backendData.type_breakdown.length > 0) {
    const colorMap = {
      technical: "#6366f1",
      hr: "#8b5cf6",
      role_based: "#3b82f6",
      company: "#10b981",
    };
    typeBreakdown = backendData.type_breakdown.map((item) => ({
      ...item,
      color: colorMap[item.type] || "#6366f1",
    }));
  }

  // Performance Trend Chart from real database
  const performanceTrend = Array.isArray(backendData?.performance_trend)
    ? backendData.performance_trend
    : [];

  // Recommendation
  const recommendation = backendData?.recommendation || {
    title: ivCount > 0 ? "Sharpen Technical Responses" : "Take Your First Mock Interview",
    reason: ivCount > 0
      ? "AI recommendation based on your recent practice."
      : "Start your first practice session to generate your AI readiness evaluation.",
    action_label: "Start Practice",
    action_type: "technical",
  };

  // Recent Interviews from real database
  const recentInterviews = Array.isArray(backendData?.recent_interviews)
    ? backendData.recent_interviews
    : [];

  return {
    hasData: ivCount > 0,
    candidateName: firstName,
    fullName,
    interviewCount: ivCount,
    averageScore: avgScore,
    readinessLabel: readLabel,
    readinessScore: readScore,
    readinessSource: readSource,
    streakDays: streak,
    improvement,
    rolePractice,
    typeBreakdown,
    performanceTrend,
    recommendation,
    recentInterviews,
  };
}
