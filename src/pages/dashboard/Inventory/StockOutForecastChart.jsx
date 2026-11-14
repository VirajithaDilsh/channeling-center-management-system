import { useCallback, useMemo, useState } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { ToggleButton, ToggleButtonGroup, Chip, Alert } from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WidgetCard from "../widgets/WidgetCard";
import useReportData from "../Reports/useReportData";
import { getMedicineStockoutPredictions } from "../../../api/MedicineApi";
import {
  EXPIRY_STATUS_CLASSES,
  EXPIRY_STATUS_LABELS,
  formatColomboYmd,
  getColomboDateParts,
  getExpiryStatus,
} from "../../../utils/inventory";

// Matches ForecastChart.jsx palette & line semantics:
// Dashed amber = projected estimate, dotted muted line = threshold reference.
const ESTIMATE = "#d97706";
const REORDER = "#dc2626";

const RISK_CHIP_COLORS = {
  CRITICAL: "error",
  HIGH: "warning",
  MEDIUM: "info",
  LOW: "success",
};

function addColomboDaysLabel(offsetDays) {
  const parts = getColomboDateParts(new Date());
  if (!parts) return `Day ${offsetDays}`;
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + offsetDays));
  const mm = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm} ${dd}`;
}

/**
 * Generates projected daily remaining stock points from backend prediction
 * values. Stock is clamped at >= 0 and assumes no replenishment.
 */
function buildStockProjectionSeries({
  currentStock,
  dailyConsumption,
  reorderLevel,
  horizonDays,
}) {
  const startStock = Math.max(0, Number(currentStock) || 0);
  const rate = Math.max(0, Number(dailyConsumption) || 0);
  const reorder = Math.max(0, Number(reorderLevel) || 0);

  const labels = [];
  const projected = [];
  const reorderLine = [];

  for (let day = 0; day <= horizonDays; day += 1) {
    labels.push(day === 0 ? "Today" : addColomboDaysLabel(day));
    const remaining = Math.max(0, Math.round((startStock - rate * day) * 100) / 100);
    projected.push(remaining);
    reorderLine.push(reorder);
  }

  return { labels, projected, reorderLine };
}

export default function StockOutForecastChart({ medicine, thresholdDays = 30 }) {
  const [horizonDays, setHorizonDays] = useState(30);
  const medicineId = medicine?._id;

  const fetcher = useCallback(async () => {
    const payload = await getMedicineStockoutPredictions(horizonDays);
    const list = Array.isArray(payload) ? payload : payload?.predictions || [];
    return list.find((item) => String(item.medicineId) === String(medicineId)) || null;
  }, [medicineId, horizonDays]);

  const { status, data: prediction, error, reload } = useReportData(
    fetcher,
    "the stock-out forecast"
  );

  const expiryStatus = getExpiryStatus(medicine, thresholdDays);
  const expiryLabel = EXPIRY_STATUS_LABELS[expiryStatus] || "Normal";
  const expiryClass = EXPIRY_STATUS_CLASSES[expiryStatus] || EXPIRY_STATUS_CLASSES.NORMAL;
  const formattedExpiry = formatColomboYmd(medicine?.expiryDate) || "—";

  const currentStock = Math.max(
    0,
    Number(prediction?.currentStock ?? medicine?.stockQuantity ?? 0)
  );
  const reorderLevel = Math.max(
    0,
    Number(prediction?.reorderLevel ?? medicine?.reorderLevel ?? 0)
  );
  const dailyConsumption = Number(prediction?.estimatedDailyConsumption ?? 0);
  const predictionOk = prediction?.predictionStatus === "ok";
  const isOutOfStock = currentStock <= 0;

  const seriesData = useMemo(() => {
    if (!predictionOk) return null;
    return buildStockProjectionSeries({
      currentStock,
      dailyConsumption,
      reorderLevel,
      horizonDays,
    });
  }, [predictionOk, currentStock, dailyConsumption, reorderLevel, horizonDays]);

  const stockOutWithinHorizon =
    prediction?.estimatedDaysUntilStockOut !== null &&
    prediction?.estimatedDaysUntilStockOut !== undefined &&
    prediction.estimatedDaysUntilStockOut <= horizonDays;

  const unitLabel = medicine?.unitType || "units";

  return (
    <WidgetCard
      title={`${medicine?.name || "Medicine"} — Stock-Out Forecast`}
      subtitle={`Batch: ${medicine?.batchNumber || "—"} • Current stock: ${currentStock} ${unitLabel}`}
      icon={<TrendingDownIcon className="text-amber-600" />}
      state={status}
      error={
        status === "error" && (error?.status === 503 || error?.status === 404)
          ? {
              label:
                "the stock-out forecast (the forecasting service is unavailable; inventory data is unaffected)",
            }
          : error
      }
      onRetry={reload}
    >
      <div className="space-y-4">
        {/* Expiry & Stock Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-medium px-2 py-0.5 rounded-lg ${expiryClass}`}>
              Expiry: {expiryLabel} ({formattedExpiry})
            </span>
            {prediction?.riskLevel && (
              <Chip
                size="small"
                label={`Risk: ${prediction.riskLevel}`}
                color={RISK_CHIP_COLORS[prediction.riskLevel] || "default"}
              />
            )}
          </div>

          <ToggleButtonGroup
            size="small"
            exclusive
            value={horizonDays}
            onChange={(_, v) => v && setHorizonDays(v)}
          >
            <ToggleButton value={14} sx={{ textTransform: "none" }}>
              14 days
            </ToggleButton>
            <ToggleButton value={30} sx={{ textTransform: "none" }}>
              30 days
            </ToggleButton>
          </ToggleButtonGroup>
        </div>

        {expiryStatus === "EXPIRED" && (
          <Alert severity="error">
            This batch expired on {formattedExpiry} and cannot be dispensed regardless of remaining stock.
          </Alert>
        )}

        {isOutOfStock && (
          <Alert severity="warning">
            Current stock is 0 {unitLabel}. This medicine is already out of stock.
          </Alert>
        )}

        {prediction && !predictionOk && (
          <Alert severity="info">
            {prediction.message ||
              "Insufficient historical dispensing data to generate a stock-out forecast."}
          </Alert>
        )}

        {!prediction && status === "success" && (
          <Alert severity="info">
            No stock-out prediction record is available for this medicine yet.
          </Alert>
        )}

        {predictionOk && seriesData && (
          <>
            <LineChart
              height={300}
              xAxis={[{ scaleType: "point", data: seriesData.labels }]}
              yAxis={[
                {
                  min: 0,
                  valueFormatter: (v) => String(Math.round(v)),
                },
              ]}
              series={[
                {
                  id: "projected-stock",
                  label: `Predicted Remaining Stock (${unitLabel})`,
                  data: seriesData.projected,
                  color: ESTIMATE,
                  showMark: false,
                  valueFormatter: (v) =>
                    v === null ? "" : `${v} ${unitLabel} (projected)`,
                },
                {
                  id: "reorder-level",
                  label: `Reorder Level (${reorderLevel} ${unitLabel})`,
                  data: seriesData.reorderLine,
                  color: REORDER,
                  showMark: false,
                  valueFormatter: (v) =>
                    v === null ? "" : `${v} ${unitLabel} (reorder level)`,
                },
              ]}
              grid={{ horizontal: true }}
              sx={{
                "& .MuiLineElement-series-projected-stock": {
                  strokeDasharray: "7 5",
                },
                "& .MuiLineElement-series-reorder-level": {
                  strokeDasharray: "3 4",
                  strokeWidth: 1.5,
                },
              }}
            />

            <div className="text-sm text-gray-700 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <Chip
                  size="small"
                  label="Estimate, assumes no replenishment"
                  sx={{ bgcolor: "#fdf0dc", color: "#92400e" }}
                />
                {prediction.modelUsed && (
                  <span>
                    Model: <b>{String(prediction.modelUsed).replace(/_/g, " ")}</b>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                <div>
                  <span className="text-gray-500 block">Daily Consumption</span>
                  <b>
                    {dailyConsumption.toFixed(2)} {unitLabel}/day
                  </b>
                </div>
                <div>
                  <span className="text-gray-500 block">Days Remaining</span>
                  <b>
                    {prediction.estimatedDaysUntilStockOut !== null &&
                    prediction.estimatedDaysUntilStockOut !== undefined
                      ? `${prediction.estimatedDaysUntilStockOut} days`
                      : "No recent usage"}
                  </b>
                </div>
                <div>
                  <span className="text-gray-500 block">Est. Stock-Out Date</span>
                  <b>
                    {prediction.estimatedStockOutDate
                      ? formatColomboYmd(prediction.estimatedStockOutDate)
                      : "Beyond horizon"}
                  </b>
                </div>
                <div>
                  <span className="text-gray-500 block">Reorder Level</span>
                  <b>
                    {reorderLevel} {unitLabel}
                  </b>
                </div>
              </div>

              {!stockOutWithinHorizon &&
                prediction.estimatedDaysUntilStockOut !== null &&
                prediction.estimatedDaysUntilStockOut !== undefined && (
                  <p className="text-xs text-gray-500">
                    Projected stock-out ({prediction.estimatedDaysUntilStockOut} days) is beyond the{" "}
                    {horizonDays}-day chart horizon.
                  </p>
                )}

              {(prediction.dataQuality?.warnings || []).map((w) => (
                <p key={w} className="text-xs text-amber-700">
                  {w}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </WidgetCard>
  );
}
