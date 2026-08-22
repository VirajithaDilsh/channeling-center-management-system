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

// Ascending by default (soonest first); pass -1 for most-recent-first.
export const compareByMoment = (a, b, direction = 1) => {
  const first = appointmentMoment(a)?.getTime() ?? 0;
  const second = appointmentMoment(b)?.getTime() ?? 0;
  return (first - second) * direction;
};
