import { Table, TableBody, TableCell, TableHead, TableRow, Chip } from "@mui/material";
import MedicationIcon from "@mui/icons-material/Medication";
import InventoryIcon from "@mui/icons-material/Inventory2";
import StethoscopeIcon from "@mui/icons-material/MedicalServices";
import WidgetCard from "./WidgetCard";
import { stockState, stockShortfallRatio, STOCK_STATE_LABELS, STOCK_STATE_COLORS } from "../../../utils/inventory";
import { isToday } from "../../../utils/appointments";

const ROW_CAP = 5;

// The counter queue, grouped per prescription rather than per item: the queue is
// a queue of people, and one patient with four medicines is one person waiting.
export function PharmacyQueueCard({ source, onRetry }) {
  const rows = (source.data || [])
    .map((p) => {
      const items = p.items || [];
      const outstanding = items.filter((i) => i.status === "QUEUED" || i.status === "PARTIAL");
      const owed = outstanding.reduce(
        (sum, i) => sum + Math.max(0, (Number(i.qtyPrescribed) || 0) - (Number(i.qtyDispensed) || 0)),
        0
      );
      return { prescription: p, outstanding, owed, done: items.length - outstanding.length, total: items.length };
    })
    .filter((row) => row.outstanding.length > 0)
    .sort((a, b) => new Date(a.prescription.createdAt) - new Date(b.prescription.createdAt));

  return (
    <WidgetCard
      title="Waiting at the pharmacy"
      subtitle="Oldest first"
      icon={<MedicationIcon className="text-emerald-600" />}
      count={rows.length}
      action={{ label: "Open pharmacy", to: "/dashboard/pharmacy" }}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
      isEmpty={rows.length === 0}
      emptyMessage="Queue is clear — nothing waiting to be dispensed."
      emptyTone="good"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell>Progress</TableCell>
            <TableCell align="right">Units owed</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, ROW_CAP).map(({ prescription, done, total, owed }) => (
            <TableRow key={prescription._id} hover>
              <TableCell>{prescription.patientName || "-"}</TableCell>
              <TableCell>{prescription.doctorName || "-"}</TableCell>
              <TableCell>{`${done} of ${total} dispensed`}</TableCell>
              <TableCell align="right">{owed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WidgetCard>
  );
}

export function LowStockCard({ source, onRetry }) {
  const rows = (source.data || [])
    .filter((m) => stockState(m) !== "ok")
    .sort((a, b) => stockShortfallRatio(a) - stockShortfallRatio(b));

  return (
    <WidgetCard
      title="Stock needing attention"
      subtitle="At or below reorder level"
      icon={<InventoryIcon className="text-amber-600" />}
      count={rows.length}
      action={{ label: "Open inventory", to: "/dashboard/inventory" }}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
      isEmpty={rows.length === 0}
      emptyMessage="Every medicine is above its reorder level."
      emptyTone="good"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Medicine</TableCell>
            <TableCell align="right">In stock</TableCell>
            <TableCell align="right">Reorder at</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, ROW_CAP).map((m) => {
            const state = stockState(m);
            return (
              <TableRow key={m._id} hover>
                <TableCell>{m.name || "-"}</TableCell>
                <TableCell align="right">{Number(m.stockQuantity) || 0}</TableCell>
                <TableCell align="right">{Number(m.reorderLevel) || "-"}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={STOCK_STATE_LABELS[state]} color={STOCK_STATE_COLORS[state]} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </WidgetCard>
  );
}

// Doctors crossed with today's bookings, so each row carries status and load
// rather than being a bare directory listing.
export function DoctorsOnDutyCard({ source, appointmentsSource, onRetry }) {
  const appointments = appointmentsSource?.data || [];
  const todays = appointments.filter((a) => isToday(a.date) && a.status !== "Cancelled");

  const rows = (source.data || []).map((d) => ({
    doctor: d,
    booked: todays.filter((a) => String(a.doctorId) === String(d._id)).length,
  }));

  return (
    <WidgetCard
      title="Doctors on duty"
      subtitle="Availability and today's load"
      icon={<StethoscopeIcon className="text-blue-500" />}
      count={rows.length}
      action={{ label: "Manage doctors", to: "/dashboard/doctor-management" }}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
      isEmpty={rows.length === 0}
      emptyMessage="No doctors registered yet."
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Doctor</TableCell>
            <TableCell>Specialization</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="right">Today</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(({ doctor, booked }) => (
            <TableRow key={doctor._id} hover>
              <TableCell>{doctor.name || "-"}</TableCell>
              <TableCell>{doctor.specialization || "-"}</TableCell>
              <TableCell align="center">
                <Chip
                  size="small"
                  label={doctor.status || "-"}
                  color={
                    doctor.status === "Available" ? "success"
                      : doctor.status === "On Leave" ? "error"
                      : "warning"
                  }
                />
              </TableCell>
              <TableCell align="right">{booked}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WidgetCard>
  );
}
