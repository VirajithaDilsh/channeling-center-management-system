import { useCallback } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import BarChartIcon from "@mui/icons-material/BarChart";
import WidgetCard from "../widgets/WidgetCard";
import useReportData from "./useReportData";
import { getMonthlyRevenue } from "../../../api/reportsApi";
import { formatLkr, formatMonth } from "../../../utils/formatMoney";

// Stacked by revenue component. Three steps of one blue so it reads as parts of
// one total rather than three categories competing for attention.
const COLORS = { doctorFees: "#9ec5f4", centerFees: "#2a78d6", medication: "#174f94" };

export default function MonthlyRevenueChart() {
  const fetcher = useCallback(() => getMonthlyRevenue(), []);
  const { status, data, error, reload } = useReportData(fetcher, "monthly revenue");
  const series = data?.series || [];
  const hasData = series.some((s) => s.totalRevenue > 0);
  const fmt = (v) => formatLkr(v);

  return (
    <WidgetCard
      title="Monthly revenue, last 12 months"
      subtitle="Fully paid visits, by month closed. The latest month may be incomplete."
      icon={<BarChartIcon className="text-blue-500" />}
      state={status}
      error={error}
      onRetry={reload}
      isEmpty={!hasData}
      emptyMessage="No fully paid visits in the last 12 months yet."
    >
      <BarChart
        height={300}
        xAxis={[{ scaleType: "band", data: series.map((s) => formatMonth(s.month) + (s.partial ? " *" : "")) }]}
        yAxis={[{ valueFormatter: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)) }]}
        series={[
          { id: "doctorFees", label: "Doctor fees", data: series.map((s) => s.doctorFees), stack: "rev", color: COLORS.doctorFees, valueFormatter: fmt },
          { id: "centerFees", label: "Center fees", data: series.map((s) => s.centerFees), stack: "rev", color: COLORS.centerFees, valueFormatter: fmt },
          { id: "medication", label: "Medication", data: series.map((s) => s.medication), stack: "rev", color: COLORS.medication, valueFormatter: fmt },
        ]}
        grid={{ horizontal: true }}
      />
      <p className="text-xs text-gray-500">* current month, still in progress</p>
    </WidgetCard>
  );
}
