import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import WidgetCard from "./WidgetCard";
import { STATUS_COLORS, isToday, compareByMoment } from "../../../utils/appointments";

const ROW_CAP = 8;

const StatusChip = ({ status }) => (
  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[status] || "bg-gray-100 text-gray-600"}`}>
    {status || "-"}
  </span>
);

// Today's list, in time order. For a doctor the source is already scoped to
// their own appointments, so the title changes rather than the query.
export default function ScheduleCard({ source, onRetry, isDoctor }) {
  const rows = (source.data || [])
    .filter((a) => isToday(a.date) && a.status !== "Cancelled")
    .sort((a, b) => compareByMoment(a, b, 1));

  const visible = rows.slice(0, ROW_CAP);

  return (
    <WidgetCard
      title={isDoctor ? "My schedule today" : "Today's schedule"}
      subtitle="In time order"
      icon={<TodayIcon className="text-blue-500" />}
      count={rows.length}
      action={{ label: "View all", to: "/dashboard/appoiments" }}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
      isEmpty={rows.length === 0}
      emptyMessage="Nothing booked for today."
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Patient</TableCell>
            {!isDoctor && <TableCell>Doctor</TableCell>}
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visible.map((a) => (
            <TableRow key={a._id} hover>
              <TableCell>{a.time || "-"}</TableCell>
              <TableCell>{a.patientName || "-"}</TableCell>
              {!isDoctor && <TableCell>{a.doctorName || "-"}</TableCell>}
              <TableCell><StatusChip status={a.status} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {rows.length > ROW_CAP && (
        <p className="text-xs text-gray-500 mt-2">
          Showing the first {ROW_CAP} of {rows.length}.
        </p>
      )}
    </WidgetCard>
  );
}
