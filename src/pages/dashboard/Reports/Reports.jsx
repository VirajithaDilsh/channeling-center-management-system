import { useCallback } from "react";
import { Typography } from "@mui/material";
import StatTile from "../../../components/StatTile";
import useReportData from "./useReportData";
import { getReportSummary } from "../../../api/reportsApi";
import { formatLkr, formatMonth } from "../../../utils/formatMoney";
import MonthlyRevenueChart from "./MonthlyRevenueChart";
import ForecastChart from "./ForecastChart";
import DoctorRevenue from "./DoctorRevenue";
import MonthCompare from "./MonthCompare";
import AssistantChat from "./AssistantChat";

// Financial analytics. Revenue = fully paid (closed) visits, dated by when they
// were closed; commission = center fee + medication. Partly paid visits are
// "outstanding", never revenue.
export default function Reports() {
  const fetcher = useCallback(() => getReportSummary(), []);
  const { status, data, error, reload } = useReportData(fetcher, "the summary");
  const loading = status === "loading";

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h5" className="font-semibold">Financial Analytics</Typography>
        <p className="text-sm text-gray-500">Actual revenue, commission and AI-assisted estimates.</p>
      </div>

      {status === "error" && (
        <p className="text-sm text-red-700">
          Couldn&apos;t load the summary{error?.status ? ` (${error.status})` : ""}.{" "}
          <button className="underline" onClick={reload}>Try again</button>
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile loading={loading} label={`Revenue, ${data ? formatMonth(data.currentMonth.period) : "this month"}`} value={data && formatLkr(data.currentMonth.totalRevenue)} sub={data && `${data.currentMonth.paidSessions} paid visit(s) · month in progress`} tone="info" />
        <StatTile loading={loading} label={`Revenue, ${data ? data.year.period : "this year"}`} value={data && formatLkr(data.year.totalRevenue)} sub={data && `${data.year.paidSessions} paid visit(s)`} />
        <StatTile loading={loading} label="Center commission, this month" value={data && formatLkr(data.currentMonth.centerCommission)} sub="Center fees + medication" tone="good" />
        <StatTile loading={loading} label="Outstanding (not revenue yet)" value={data && formatLkr(data.outstanding.unpaidBalance)} sub={data && `${data.outstanding.openSessions} open bill(s)`} tone="warning" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MonthlyRevenueChart />
        <ForecastChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <DoctorRevenue />
        <MonthCompare />
      </div>
      <AssistantChat />
    </div>
  );
}
