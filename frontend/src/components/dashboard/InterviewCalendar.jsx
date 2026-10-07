import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { formatDateKey } from "./dashboardData";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function InterviewCalendar({
  events = [],
  selectedDate,
  onSelectDate,
}) {
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => formatDateKey(today), [today]);

  const selectedKey = useMemo(
    () => (selectedDate ? formatDateKey(selectedDate) : todayKey),
    [selectedDate, todayKey]
  );

  // Set of dates that have events
  const eventDateSet = useMemo(() => {
    const set = new Set();
    events.forEach((e) => {
      if (e.dateKey) set.add(e.dateKey);
    });
    return set;
  }, [events]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthName = currentMonthDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Days calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 is Sunday

  const prevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dayNum) => {
    const clicked = new Date(year, month, dayNum);
    onSelectDate(clicked);
  };

  return (
    <div className="card-saas flex flex-col justify-between p-6">
      <div>
        {/* Calendar Header with Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-slate-900">
                Upcoming Schedule
              </h2>
              <p className="text-xs text-slate-500">
                {monthName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="mt-4 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <span
              key={wd}
              className="py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400"
            >
              {wd}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="mt-1 grid grid-cols-7 gap-1 text-center">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayWeekday }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9 w-full" />
          ))}

          {/* Month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const thisDate = new Date(year, month, dayNum);
            const thisKey = formatDateKey(thisDate);
            const isToday = thisKey === todayKey;
            const isSelected = thisKey === selectedKey;
            const hasEvent = eventDateSet.has(thisKey);

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleDateClick(dayNum)}
                className={`group relative flex h-9 w-full flex-col items-center justify-center rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : isToday
                    ? "bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-300"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <span>{dayNum}</span>

                {/* Event Indicator Dot */}
                {hasEvent && (
                  <span
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${
                      isSelected ? "bg-white" : "bg-indigo-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Notice */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="truncate">
          {selectedDate
            ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" })
            : "Select a date"}
        </span>
        <button
          type="button"
          onClick={() => onSelectDate(today)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Jump to Today
        </button>
      </div>
    </div>
  );
}
