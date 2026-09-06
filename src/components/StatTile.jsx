import { Skeleton } from "@mui/material";

// Lives at the top level rather than under pages/dashboard so DoctorHome and
// Billing — which each hand-roll this same div — can adopt it later.
const TONE_TEXT = {
  neutral: "text-gray-900",
  good: "text-green-600",
  info: "text-blue-600",
  warning: "text-amber-600",
  critical: "text-red-600",
};

export default function StatTile({
  label,
  value,
  sub,
  tone = "neutral",
  loading = false,
  className = "",
}) {
  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm ${className}`}>
      <p className="text-sm text-gray-500">{label}</p>

      {loading ? (
        <Skeleton variant="text" width="60%" height={38} />
      ) : (
        <p className={`text-2xl font-bold ${TONE_TEXT[tone] || TONE_TEXT.neutral}`}>{value}</p>
      )}

      {sub && !loading && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}
