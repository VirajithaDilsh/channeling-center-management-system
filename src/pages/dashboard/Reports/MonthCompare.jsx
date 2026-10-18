import { useState } from "react";
import { Button, TextField, Alert } from "@mui/material";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import WidgetCard from "../widgets/WidgetCard";
import { compareMonths } from "../../../api/reportsApi";
import { formatLkr, formatMonth, currentMonthKey } from "../../../utils/formatMoney";

const prevMonthKey = () => {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function MonthCompare() {
  const [a, setA] = useState(currentMonthKey());
  const [b, setB] = useState(prevMonthKey());
  const [state, setState] = useState({ status: "idle" });

  const run = async () => {
    setState({ status: "loading" });
    try {
      setState({ status: "success", data: await compareMonths(a, b) });
    } catch (err) {
      setState({ status: "error", message: err.response?.data?.message || "Couldn't compare these months." });
    }
  };

  const d = state.data;
  const up = d && d.change.revenue > 0;
  return (
    <WidgetCard title="Compare two months" subtitle="Fully paid visits" icon={<CompareArrowsIcon className="text-blue-500" />}>
      <div className="flex flex-wrap gap-3 items-center mb-3">
        <TextField type="month" size="small" label="Month A" value={a} onChange={(e) => e.target.value && setA(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField type="month" size="small" label="Month B" value={b} onChange={(e) => e.target.value && setB(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <Button variant="contained" onClick={run} disabled={state.status === "loading"} sx={{ textTransform: "none" }}>
          {state.status === "loading" ? "Comparing…" : "Compare"}
        </Button>
      </div>
      {state.status === "error" && <Alert severity="error">{state.message}</Alert>}
      {d && (
        <div className="text-sm space-y-1">
          <p>{formatMonth(d.monthA.period)}: <b>{formatLkr(d.monthA.totalRevenue)}</b> ({d.monthA.paidSessions} visits)</p>
          <p>{formatMonth(d.monthB.period)}: <b>{formatLkr(d.monthB.totalRevenue)}</b> ({d.monthB.paidSessions} visits)</p>
          <p className={d.change.revenue === 0 ? "" : up ? "text-green-700" : "text-red-700"}>
            Difference: <b>{up ? "+" : d.change.revenue < 0 ? "-" : ""}{formatLkr(Math.abs(d.change.revenue))}</b>
            {d.change.revenuePct !== null ? ` (${d.change.revenuePct > 0 ? "+" : ""}${d.change.revenuePct}%)` : " (no revenue in Month B)"}
          </p>
          {(d.monthA.period === currentMonthKey() || d.monthB.period === currentMonthKey()) && (
            <p className="text-xs text-gray-500">The current month is still in progress, so the comparison is incomplete.</p>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
