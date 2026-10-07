/**
 * notificationStorage.js
 * Manages user notifications in localStorage, syncing with scheduled events
 * and providing practice reminders (e.g. daily, 3-day interview cadence, schedules).
 */

const NOTIFICATION_STORAGE_KEY = "iq_user_notifications";
const DISMISSED_KEY = "iq_dismissed_notifications";

export function getDismissedIds() {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDismissedId(id) {
  try {
    const ids = getDismissedIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
    }
  } catch (err) {
    console.error("Failed to save dismissed notification", err);
  }
}

export function generateDefaultNotifications() {
  // Read scheduled events from localStorage
  let scheduledEvents = [];
  try {
    const rawEvents = localStorage.getItem("iq_scheduled_events");
    if (rawEvents) scheduledEvents = JSON.parse(rawEvents);
  } catch {
    scheduledEvents = [];
  }

  const dismissed = getDismissedIds();
  const list = [];

  // 1. Scheduled Events notifications
  const todayStr = new Date().toISOString().split("T")[0];
  const now = new Date();

  scheduledEvents.forEach((ev) => {
    const isToday = ev.date === todayStr;
    let isMatched = false;

    if (isToday && ev.time) {
      const [hours, minutes] = ev.time.split(":").map(Number);
      const evDate = new Date();
      evDate.setHours(hours, minutes, 0, 0);
      const diffMins = (now.getTime() - evDate.getTime()) / (1000 * 60);
      // matched if within 15 min before or anytime after scheduled time today
      isMatched = diffMins >= -15;
    }

    const notifId = `notif_schedule_${ev.id}`;
    if (!dismissed.includes(notifId)) {
      list.push({
        id: notifId,
        type: isMatched ? "schedule_matched" : "schedule",
        title: isMatched
          ? `Interview Ready: ${ev.title || "Practice Session"}`
          : `Upcoming Session: ${ev.title || "Mock Interview"}`,
        message: isMatched
          ? `Your scheduled ${ev.type || "technical"} interview time (${ev.time}) has arrived! The AI interviewer is ready. Click Start to begin.`
          : `You have a ${ev.type || "technical"} practice session scheduled for ${ev.date === todayStr ? "today" : ev.date} at ${ev.time}. Prepare your technical examples!`,
        time: isMatched ? "Time Matched · Now" : `${ev.date === todayStr ? "Today" : ev.date} at ${ev.time}`,
        date: ev.date,
        eventData: ev,
      });
    }
  });

  // 2. Schedule alert fallback if no user schedule exists
  if (scheduledEvents.length === 0) {
    const schedPlaceholderId = "notif_sched_reminder_general";
    if (!dismissed.includes(schedPlaceholderId)) {
      list.push({
        id: schedPlaceholderId,
        type: "schedule",
        title: "Schedule Your Next Session",
        message: "Plan ahead! Add an interview practice session to your calendar using the 'Schedule' button on your dashboard.",
        time: "Schedule Alert",
      });
    }
  }

  // 3. Reminding of giving interview every 3rd day
  const cadenceId = "notif_cadence_3day";
  if (!dismissed.includes(cadenceId)) {
    list.push({
      id: cadenceId,
      type: "cadence",
      title: "3-Day Mock Interview Cadence",
      message: "It's time for your 3-day comprehensive mock interview! Taking a full session every 3 days builds answer recall, sharpens your STAR responses, and keeps your readiness score climbing.",
      time: "Cadence: Every 3rd Day",
    });
  }

  // 4. Daily practice reminder
  const practiceId = "notif_practice_daily";
  if (!dismissed.includes(practiceId)) {
    list.push({
      id: practiceId,
      type: "practice",
      title: "Daily Practice Reminder",
      message: "Consistency is key to mastering technical and behavioral interviews. Spend 10 to 15 minutes today reviewing question patterns and architectural concepts.",
      time: "Daily Habit",
    });
  }

  // 5. Readiness tracking insight
  const readinessId = "notif_readiness_score";
  if (!dismissed.includes(readinessId)) {
    list.push({
      id: readinessId,
      type: "readiness",
      title: "ML Readiness Analysis Available",
      message: "Your interview readiness estimate has been updated. Review your technical, communication, and problem-solving benchmarks on your dashboard.",
      time: "Recent Update",
    });
  }

  return list;
}

export function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }

  const initial = generateDefaultNotifications();
  saveNotifications(initial);
  return initial;
}

export function saveNotifications(notifications) {
  try {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event("iq_notifications_changed"));
  } catch (err) {
    console.error("Error saving notifications", err);
  }
}

export function removeNotification(id) {
  const current = loadNotifications();
  const updated = current.filter((n) => n.id !== id);
  saveDismissedId(id);
  saveNotifications(updated);
  return updated;
}

export function resetNotifications() {
  localStorage.removeItem(DISMISSED_KEY);
  const fresh = generateDefaultNotifications();
  saveNotifications(fresh);
  return fresh;
}
