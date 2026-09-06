// Shared appointment date/status helpers, so the admin Appointment Management
// page and the doctor portal bucket "upcoming" exactly the same way.

export const STATUS_COLORS = {
  Scheduled: "bg-blue-100 text-blue-600",
  Completed: "bg-green-100 text-green-600",
  Cancelled: "bg-red-100 text-red-600",
};

// `date` is stored as a Date at midnight and `time` as a separate "HH:mm"
// string, so the real moment of an appointment has to be combined from both —
// same approach as combineDateAndTime in the backend's appointmentController.
// A date with no time is treated as end-of-day so that a booking made for
// today without a time doesn't immediately count as elapsed.
export const appointmentMoment = (appointment) => {
  const moment = new Date(appointment.date);
  if (Number.isNaN(moment.getTime())) return null;

  if (appointment.time && /^\d{1,2}:\d{2}/.test(appointment.time)) {
    const [hours, minutes] = appointment.time.split(":").map(Number);
    moment.setHours(hours, minutes, 0, 0);
  } else {
    moment.setHours(23, 59, 59, 999);
  }

  return moment;
};

export const isToday = (dateValue) => {
  if (!dateValue) return false;
  return new Date(dateValue).toDateString() === new Date().toDateString();
};

// Upcoming means still going to happen: a future slot that is also still
// Scheduled. Cancelled and Completed bookings are history regardless of date.
export const isUpcomingAppointment = (appointment, now = Date.now()) => {
  if (appointment.status !== "Scheduled") return false;
  const moment = appointmentMoment(appointment);
  return moment ? moment.getTime() >= now : false;
};

// Whether an appointment belongs to a given doctor.
//
// Single-sourced because the doctor portal and the dashboard must agree on
// "mine" exactly. The doctorId comparison is String()-coerced so it survives
// the appointment's doctorId being an ObjectId rather than a string, and the
// doctorName fallback exists only for accounts whose login email never matched
// a Doctor record. With neither identity available it owns nothing — denying is
// the safe default, since the alternative leaks every doctor's patients.
export const belongsToDoctor = (appointment, { doctorId, doctorName } = {}) => {
  if (doctorId) return String(appointment?.doctorId) === String(doctorId);
  if (doctorName) return appointment?.doctorName === doctorName;
  return false;
};

// Buckets a date into a stable per-day key.
//
// toDateString() rather than toISOString().slice(0, 10): `date` is stored at
// midnight, so ISO slicing shifts it to the previous day in any timezone behind
// UTC. This matches how isToday above compares.
export const dayKey = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toDateString();
};

// The last N calendar days ending today, oldest first.
export const lastNDays = (count) =>
  Array.from({ length: count }, (unused, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (count - 1 - index));
    return date;
  });

// Ascending by default (soonest first); pass -1 for most-recent-first.
export const compareByMoment = (a, b, direction = 1) => {
  const first = appointmentMoment(a)?.getTime() ?? 0;
  const second = appointmentMoment(b)?.getTime() ?? 0;
  return (first - second) * direction;
};
