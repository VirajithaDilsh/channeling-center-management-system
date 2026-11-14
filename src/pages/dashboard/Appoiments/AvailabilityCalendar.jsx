import React, { useMemo, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n) => String(n).padStart(2, "0");
// Local-date key (avoids the timezone shift of toISOString).
const key = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

/**
 * Month grid that highlights available dates.
 * availableDates / fullDates: arrays of "YYYY-MM-DD".
 * Remount (via `key`) when the data set changes so the view jumps to its first month.
 */
const AvailabilityCalendar = ({ availableDates = [], fullDates = [], value, onChange }) => {
  const available = useMemo(() => new Set(availableDates), [availableDates]);
  const full = useMemo(() => new Set(fullDates), [fullDates]);

  const sorted = useMemo(() => [...availableDates].sort(), [availableDates]);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const parse = (k) => {
    const [y, m] = k.split("-").map(Number);
    return { y, m: m - 1 };
  };

  const [view, setView] = useState(() => {
    if (first) return parse(first);
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() };
  });

  // Selectable years: from the earliest to the latest of (today, available dates).
  const thisYear = new Date().getFullYear();
  const minYear = Math.min(thisYear, first ? parse(first).y : thisYear);
  const maxYear = Math.max(thisYear, last ? parse(last).y : thisYear);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);

  const idx = (v) => v.y * 12 + v.m;
  const canPrev = idx(view) > minYear * 12;
  const canNext = idx(view) < maxYear * 12 + 11;

  const shift = (delta) => {
    const total = idx(view) + delta;
    setView({ y: Math.floor(total / 12), m: total % 12 });
  };

  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  // Monday-first offset
  const offset = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-3 shadow-sm select-none">
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => shift(-1)}
          disabled={!canPrev}
          className="grid h-7 w-7 place-items-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Previous month"
        >
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
        </button>
        <div className="flex items-center gap-1">
          <select
            value={view.m}
            onChange={(e) => setView({ ...view, m: Number(e.target.value) })}
            className="cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus:outline-none"
            aria-label="Month"
          >
            {MONTHS.map((name, i) => (
              <option key={name} value={i}>{name}</option>
            ))}
          </select>
          <select
            value={view.y}
            onChange={(e) => setView({ ...view, y: Number(e.target.value) })}
            className="cursor-pointer rounded-md bg-transparent px-1 py-0.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 focus:outline-none"
            aria-label="Year"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          disabled={!canNext}
          className="grid h-7 w-7 place-items-center rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Next month"
        >
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium uppercase tracking-wide text-gray-400 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d.slice(0, 2)}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 justify-items-center">
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const k = key(view.y, view.m, day);
          const isAvailable = available.has(k) && !full.has(k);
          const isSelected = value === k;

          let cls = "h-9 w-9 rounded-full text-sm transition-colors ";
          if (isSelected) cls += "bg-blue-600 text-white font-semibold shadow";
          else if (isAvailable) cls += "bg-blue-50 text-blue-700 font-semibold hover:bg-blue-100";
          else cls += "text-gray-500 cursor-not-allowed";

          return (
            <button
              key={k}
              type="button"
              disabled={!isAvailable}
              onClick={() => onChange(k)}
              className={cls}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
