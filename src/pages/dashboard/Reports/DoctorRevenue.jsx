import { useCallback, useState } from "react";
import { TextField } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import WidgetCard from "../widgets/WidgetCard";
import useReportData from "./useReportData";
import { getRevenueByDoctor } from "../../../api/reportsApi";
import { formatLkr, currentMonthKey } from "../../../utils/formatMoney";

export default function DoctorRevenue() {
  const [month, setMonth] = useState(currentMonthKey());
  const fetcher = useCallback(() => getRevenueByDoctor({ month }), [month]);
  const { status, data, error, reload } = useReportData(fetcher, "doctor revenue");
  const doctors = data?.doctors || [];
  const max = Math.max(1, ...doctors.map((d) => d.totalRevenue));

  return (
    <WidgetCard
      title="Revenue by doctor"
      subtitle="Fully paid visits, including the center's share"
      icon={<PersonIcon className="text-blue-500" />}
      state={status}
      error={error}
      onRetry={reload}
      isEmpty={doctors.length === 0}
      emptyMessage="No fully paid visits for this month."
    >
      <TextField type="month" size="small" label="Month" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ mb: 2 }} />
      <ul className="space-y-3">
        {doctors.map((d) => (
          <li key={d.doctorId || d.doctorName}>
            <div className="flex justify-between text-sm">
              <span className="font-medium">{d.doctorName}</span>
              <span>{formatLkr(d.totalRevenue)}</span>
            </div>
            <div className="h-2 bg-blue-50 rounded mt-1">
              <div className="h-2 rounded bg-[#2a78d6]" style={{ width: `${(d.totalRevenue / max) * 100}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {d.paidSessions} visit(s) · doctor fees {formatLkr(d.doctorFees)} · center commission {formatLkr(d.centerCommission)}
            </p>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}
