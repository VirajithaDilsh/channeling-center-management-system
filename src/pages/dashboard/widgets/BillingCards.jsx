import { Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { useNavigate } from "react-router-dom";
import WidgetCard from "./WidgetCard";
import { balanceOf, totalOf } from "../../../utils/visitSessions";
import { isToday } from "../../../utils/appointments";

const ROW_CAP = 5;

// When a visit entered a given status, from the session's own audit trail. Used
// to sort the collection queue by who has been waiting longest rather than by
// creation order — a fairness signal the Billing table doesn't offer.
const enteredStatusAt = (session, status) => {
  const entry = (session?.statusHistory || []).filter((h) => h?.to === status).pop();
  return entry?.at ? new Date(entry.at).getTime() : null;
};

const waitedLabel = (session) => {
  const since = enteredStatusAt(session, "READY_FOR_PAYMENT");
  if (!since) return "-";
  const minutes = Math.max(0, Math.round((Date.now() - since) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} h` : `${Math.floor(hours / 24)} d`;
};

export function AwaitingPaymentCard({ source, onRetry, money }) {
  const navigate = useNavigate();

  const rows = (source.data || [])
    .filter((s) => s.status === "READY_FOR_PAYMENT")
    .sort((a, b) => (enteredStatusAt(a, "READY_FOR_PAYMENT") ?? 0) - (enteredStatusAt(b, "READY_FOR_PAYMENT") ?? 0));

  return (
    <WidgetCard
      title="Waiting to be collected"
      subtitle="Longest wait first"
      icon={<PaymentsIcon className="text-blue-500" />}
      count={rows.length}
      action={{ label: "Open billing", to: "/dashboard/billing" }}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
      isEmpty={rows.length === 0}
      emptyMessage="No bills waiting to be collected."
      emptyTone="good"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Patient</TableCell>
            <TableCell>Doctor</TableCell>
            <TableCell align="right">Balance</TableCell>
            <TableCell align="right">Waiting</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, ROW_CAP).map((s) => (
            <TableRow key={s._id} hover>
              <TableCell>{s.patientName || "-"}</TableCell>
              <TableCell>{s.doctorName || "-"}</TableCell>
              <TableCell align="right">{money(balanceOf(s))}</TableCell>
              <TableCell align="right">{waitedLabel(s)}</TableCell>
              <TableCell align="right">
                <Button size="small" sx={{ textTransform: "none" }} onClick={() => navigate(`/dashboard/billing/${s._id}`)}>
                  Collect
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WidgetCard>
  );
}

// Visits that started on an earlier day and never reached payment. Nothing else
// in the app surfaces these, and each one is a consultation that happened but
// was never billed — the most expensive thing on the dashboard to leave unseen.
export function StuckVisitsCard({ source, onRetry, money }) {
  const navigate = useNavigate();

  const rows = (source.data || [])
    .filter(
      (s) =>
        ["OPEN", "PENDING_PHARMACY"].includes(s.status) &&
        s.createdAt &&
        !isToday(s.createdAt)
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <WidgetCard
      title="Visits left open"
      subtitle="Started before today and never closed"
      icon={<ReportProblemIcon className="text-amber-600" />}
      count={rows.length}
      action={{ label: "Open billing", to: "/dashboard/billing" }}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
      isEmpty={rows.length === 0}
      emptyMessage="Nothing left open from earlier days."
      emptyTone="good"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Opened</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Stage</TableCell>
            <TableCell align="right">So far</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, ROW_CAP).map((s) => (
            <TableRow key={s._id} hover>
              <TableCell>{new Date(s.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>{s.patientName || "-"}</TableCell>
              <TableCell>{s.status === "OPEN" ? "In consultation" : "At pharmacy"}</TableCell>
              <TableCell align="right">{money(totalOf(s))}</TableCell>
              <TableCell align="right">
                <Button size="small" sx={{ textTransform: "none" }} onClick={() => navigate(`/dashboard/billing/${s._id}`)}>
                  Open
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </WidgetCard>
  );
}
