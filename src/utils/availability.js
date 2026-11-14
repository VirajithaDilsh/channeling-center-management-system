// Weekly availability helpers shared by Settings, Doctors pages and booking.
// dayOfWeek: 0 = Sunday ... 6 = Saturday (matches the backend).
export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Display order Monday -> Sunday.
export const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const sortWindows = (windows = []) =>
  [...windows].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek) ||
      a.startTime.localeCompare(b.startTime)
  );

export const maxLabel = (w) => (w.maxPatients ? `max ${w.maxPatients}` : "no limit");

// "Mon 10:00–12:00 · max 10"
export const formatWindow = (w) =>
  `${DAY_SHORT[w.dayOfWeek]} ${w.startTime}–${w.endTime} · ${maxLabel(w)}`;
