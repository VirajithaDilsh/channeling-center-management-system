import StatTile from "../../../components/StatTile";
import { isToday, isUpcomingAppointment } from "../../../utils/appointments";
import { balanceOf } from "../../../utils/visitSessions";
import { stockState } from "../../../utils/inventory";
import { dayKey } from "../../../utils/appointments";

// The numbers strip. Each tile is built only if its source is available, so the
// strip is naturally shorter for a thin role rather than showing empty slots.
export default function KpiStrip({ sources, money }) {
  const tiles = [];

  const appointments = sources.appointments;
  if (appointments.status !== "skipped") {
    const rows = appointments.data || [];
    const todays = rows.filter((a) => isToday(a.date) && a.status !== "Cancelled");
    const done = todays.filter((a) => a.status === "Completed").length;

    tiles.push({
      key: "today",
      label: "Today's appointments",
      value: todays.length,
      sub: todays.length ? `${done} done · ${todays.length - done} to go` : "Nothing booked today",
      loading: appointments.status === "loading",
    });

    tiles.push({
      key: "upcoming",
      label: "Still to come",
      value: rows.filter((a) => isUpcomingAppointment(a) && !isToday(a.date)).length,
      sub: "After today",
      tone: "info",
      loading: appointments.status === "loading",
    });
  }

  const visitSessions = sources.visitSessions;
  if (money && visitSessions.status !== "skipped") {
    const rows = visitSessions.data || [];
    const awaiting = rows.filter((s) => s.status === "READY_FOR_PAYMENT");
    const uncollected = awaiting.reduce((sum, s) => sum + balanceOf(s), 0);

    // Deliberately not "all-time revenue": what a cashier reconciles at the end
    // of a shift is what actually landed today, and a payment taken today
    // against an older bill belongs in today's figure — so this buckets on the
    // payment's own receivedAt, not on when the visit was created.
    const today = dayKey(new Date());
    const collectedToday = rows
      .flatMap((s) => (Array.isArray(s.payments) ? s.payments : []))
      .filter((p) => dayKey(p?.receivedAt) === today)
      .reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);

    tiles.push({
      key: "uncollected",
      label: "Waiting to be collected",
      value: money(uncollected),
      sub: `${awaiting.length} bill${awaiting.length === 1 ? "" : "s"}`,
      tone: uncollected > 0 ? "warning" : "good",
      loading: visitSessions.status === "loading",
    });

    tiles.push({
      key: "collected",
      label: "Collected today",
      value: money(collectedToday),
      sub: "Payments received today",
      tone: "good",
      loading: visitSessions.status === "loading",
    });
  }

  const pharmacyQueue = sources.pharmacyQueue;
  if (pharmacyQueue.status !== "skipped") {
    const outstanding = (pharmacyQueue.data || []).flatMap((p) =>
      (p.items || []).filter((i) => i.status === "QUEUED" || i.status === "PARTIAL")
    );

    tiles.push({
      key: "pharmacy",
      label: "Waiting at pharmacy",
      value: outstanding.length,
      sub: outstanding.length ? "Items still to dispense" : "Queue is clear",
      tone: outstanding.length ? "warning" : "good",
      loading: pharmacyQueue.status === "loading",
    });
  }

  const medicines = sources.medicines;
  if (medicines.status !== "skipped") {
    const rows = medicines.data || [];
    const short = rows.filter((m) => stockState(m) !== "ok");
    const out = rows.filter((m) => stockState(m) === "out").length;

    tiles.push({
      key: "stock",
      label: "Needs reordering",
      value: short.length,
      sub: out ? `${out} out of stock` : "None out of stock",
      tone: out ? "critical" : short.length ? "warning" : "good",
      loading: medicines.status === "loading",
    });
  }

  const doctors = sources.doctors;
  if (doctors.status !== "skipped") {
    const rows = doctors.data || [];
    const available = rows.filter((d) => d.status === "Available").length;
    const onLeave = rows.filter((d) => d.status === "On Leave").length;

    tiles.push({
      key: "doctors",
      label: "Doctors available",
      value: `${available}/${rows.length}`,
      sub: onLeave ? `${onLeave} on leave` : "None on leave",
      loading: doctors.status === "loading",
    });
  }

  if (tiles.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {tiles.map(({ key, ...tile }) => (
        <StatTile key={key} {...tile} />
      ))}
    </div>
  );
}
