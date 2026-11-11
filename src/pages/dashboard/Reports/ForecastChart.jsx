import { useCallback, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { ToggleButton, ToggleButtonGroup, Chip, Alert } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WidgetCard from "../widgets/WidgetCard";
import useReportData from "./useReportData";
import { getRevenueForecast } from "../../../api/reportsApi";
import { formatLkr, formatMonth } from "../../../utils/formatMoney";

// Solid blue = money actually collected. Dashed amber = estimate. Never the same
// colour or line style, so an estimate can't be read as a figure.
const ACTUAL = "#2a78d6";
const ESTIMATE = "#d97706";
const RANGE = "#e6b980";

export default function ForecastChart() {
  const [horizon, setHorizon] = useState(1);
  const fetcher = useCallback(() => getRevenueForecast(horizon), [horizon]);
  const { status, data, error, reload } = useReportData(fetcher, "the forecast");

  const f = data?.forecast;
  const ok = f?.status === "ok";
  const partial = data?.actuals.find((a) => a.partial);
  const complete = data ? data.actuals.filter((a) => !a.partial) : [];
  // Trim the long run of leading zero months so the chart starts at real data.
  const firstReal = complete.findIndex((a) => a.value > 0);
  const history = firstReal >= 0 ? complete.slice(firstReal) : [];

  let chart = null;
  if (ok && history.length) {
    const months = [...history.map((a) => a.month), ...f.forecast.map((p) => p.month)];
    const pad = (arr, lead) => [...Array(lead).fill(null), ...arr];
    const actualData = [...history.map((a) => a.value), ...f.forecast.map(() => null)];
    // The estimate line starts at the last actual so the two visibly join.
    const lastActual = history[history.length - 1].value;
    const estData = pad([lastActual, ...f.forecast.map((p) => p.value)], history.length - 1);
    const lowData = pad([lastActual, ...f.forecast.map((p) => p.lower)], history.length - 1);
    const highData = pad([lastActual, ...f.forecast.map((p) => p.upper)], history.length - 1);
    chart = (
      <LineChart
        height={300}
        xAxis={[{ scaleType: "point", data: months.map(formatMonth) }]}
        yAxis={[{ valueFormatter: (v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)) }]}
        series={[
          { id: "actual", label: "Actual", data: actualData, color: ACTUAL, showMark: true, valueFormatter: (v) => (v === null ? "" : formatLkr(v)) },
          { id: "estimate", label: "Estimate", data: estData, color: ESTIMATE, showMark: true, valueFormatter: (v) => (v === null ? "" : `${formatLkr(v)} (estimate)`) },
          { id: "low", label: "Range (low)", data: lowData, color: RANGE, showMark: false, valueFormatter: (v) => (v === null ? "" : formatLkr(v)) },
          { id: "high", label: "Range (high)", data: highData, color: RANGE, showMark: false, valueFormatter: (v) => (v === null ? "" : formatLkr(v)) },
        ]}
        grid={{ horizontal: true }}
        sx={{
          "& .MuiLineElement-series-estimate": { strokeDasharray: "7 5" },
          "& .MuiLineElement-series-low, & .MuiLineElement-series-high": { strokeDasharray: "2 4", strokeWidth: 1.5 },
        }}
      />
    );
  }

  return (
    <WidgetCard
      title="Actual vs predicted revenue"
      subtitle="Solid = actual revenue · dashed = estimate"
      icon={<TrendingUpIcon className="text-amber-600" />}
      state={status}
      error={status === "error" && error?.status === 503 ? { label: "the forecast (the forecasting service is unavailable; actual figures above are unaffected)" } : error}
      onRetry={reload}
    >
      {data && (
        <div className="space-y-3">
          <ToggleButtonGroup size="small" exclusive value={horizon} onChange={(_, v) => v && setHorizon(v)}>
            <ToggleButton value={1} sx={{ textTransform: "none" }}>Next month</ToggleButton>
            <ToggleButton value={3} sx={{ textTransform: "none" }}>Next 3 months</ToggleButton>
          </ToggleButtonGroup>

          {!ok && <Alert severity="info">{f?.message || "No forecast available."}</Alert>}
          {chart}

          {ok && (
            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <Chip size="small" label="Estimate, not actual revenue" sx={{ bgcolor: "#fdf0dc", color: "#92400e" }} />
                <span>Forecast period: <b>{formatMonth(f.forecast[0].month)}{f.forecast.length > 1 ? ` – ${formatMonth(f.forecast[f.forecast.length - 1].month)}` : ""}</b></span>
                <span>Model: <b>{f.model.replace(/_/g, " ")}</b></span>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                {f.forecast.map((p) => (
                  <span key={p.month}>{formatMonth(p.month)}: <b>{formatLkr(p.value)}</b> <span className="text-gray-500">({formatLkr(p.lower)} – {formatLkr(p.upper)})</span></span>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Validation: {f.validation.method}, {f.validation.folds} folds. Average error {formatLkr(f.validation.mae)} per month
                {f.validation.wape !== null && ` (${(f.validation.wape * 100).toFixed(1)}% of revenue)`};
                baseline (repeat last month) error {formatLkr(f.validation.baselineMae)}
                {f.validation.beatsBaseline ? " — the model beats the baseline." : " — the model does not beat the baseline."}
                {" "}Range is approximate (~80%).
              </p>
              {f.dataQuality.warnings.map((w) => <p key={w} className="text-xs text-amber-700">{w}</p>)}
            </div>
          )}
          {partial && (
            <p className="text-xs text-gray-500">
              {formatMonth(partial.month)} is still in progress ({formatLkr(partial.value)} so far) and is not used for training.
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  );
}
