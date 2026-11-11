import { BarChart } from "@mui/x-charts/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import WidgetCard from "./WidgetCard";
import { dayKey, lastNDays } from "../../../utils/appointments";

const DAYS = 7;
const HEIGHT = 240;

// Two steps of one blue, so today reads as emphasised rather than as a different
// category. Not a value ramp — every history bar is the same weight.
const PAST = "#9ec5f4";
const TODAY = "#2a78d6";

const buildBuckets = () => {
  const days = lastNDays(DAYS);
  return {
    keys: days.map((d) => dayKey(d)),
    labels: days.map((d) => d.toLocaleDateString(undefined, { weekday: "short" })),
  };
};

const colorMap = (labels) => ({
  type: "ordinal",
  values: labels,
  colors: labels.map((unused, index) => (index === labels.length - 1 ? TODAY : PAST)),
});

// A chart of seven zero-height bars is the most broken-looking thing a new
// install can show, so an all-zero series is replaced by a sentence.
const NotEnoughYet = ({ children }) => (
  <p className="text-sm text-gray-500 py-6">{children}</p>
);

export function AppointmentsTrendChart({ source, onRetry }) {
  const { keys, labels } = buildBuckets();
  const rows = source.data || [];

  const counts = keys.map(
    (key) => rows.filter((a) => a.status !== "Cancelled" && dayKey(a.date) === key).length
  );
  const hasData = counts.some((n) => n > 0);

  return (
    <WidgetCard
      title="Appointments, last 7 days"
      subtitle="Today highlighted"
      icon={<ShowChartIcon className="text-blue-500" />}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
    >
      {hasData ? (
        <BarChart
          height={HEIGHT}
          xAxis={[{ scaleType: "band", data: labels, colorMap: colorMap(labels) }]}
          yAxis={[{ tickMinStep: 1 }]}
          series={[{ data: counts, label: "Appointments" }]}
          borderRadius={4}
          grid={{ horizontal: true }}
          slotProps={{ legend: { hidden: true } }}
        />
      ) : (
        <NotEnoughYet>Not enough history yet — this fills in as appointments are booked.</NotEnoughYet>
      )}
    </WidgetCard>
  );
}

export function CollectionsTrendChart({ source, onRetry, money, currencySymbol }) {
  const { keys, labels } = buildBuckets();

  // Bucketed on each payment's own receivedAt, never on the visit's createdAt:
  // money taken today against last week's bill belongs in today's column.
  const payments = (source.data || []).flatMap((s) => (Array.isArray(s.payments) ? s.payments : []));

  const totals = keys.map((key) =>
    payments
      .filter((p) => dayKey(p?.receivedAt) === key)
      .reduce((sum, p) => sum + (Number(p?.amount) || 0), 0)
  );
  const hasData = totals.some((n) => n > 0);

  return (
    <WidgetCard
      title="Collected, last 7 days"
      subtitle="By the day the payment was taken"
      icon={<ShowChartIcon className="text-green-600" />}
      state={source.status === "skipped" ? "success" : source.status}
      error={source.error}
      onRetry={onRetry}
    >
      {hasData ? (
        <BarChart
          height={HEIGHT}
          xAxis={[{ scaleType: "band", data: labels, colorMap: colorMap(labels) }]}
          yAxis={[{ valueFormatter: (value) => `${currencySymbol} ${value}` }]}
          series={[{ data: totals, label: "Collected", valueFormatter: (value) => money(value) }]}
          borderRadius={4}
          grid={{ horizontal: true }}
          slotProps={{ legend: { hidden: true } }}
        />
      ) : (
        <NotEnoughYet>No payments recorded in the last 7 days.</NotEnoughYet>
      )}
    </WidgetCard>
  );
}
