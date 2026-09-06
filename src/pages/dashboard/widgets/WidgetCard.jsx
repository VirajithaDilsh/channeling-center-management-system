import { Paper, Typography, Button, Skeleton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

// The shell every dashboard card wears, so the four states below are implemented
// once instead of in each widget.
//
// The `emptyTone` distinction matters more than it looks: for most of these
// cards an empty list means the clinic is under control — nothing waiting at the
// pharmacy, no uncollected bills, nothing below reorder level. Rendering that as
// a bare table saying "no rows" reads as broken. A green tick reads as calm.
export default function WidgetCard({
  title,
  subtitle,
  icon,
  count,
  action,
  state = "success",
  error,
  onRetry,
  isEmpty = false,
  emptyMessage = "Nothing to show.",
  emptyTone = "neutral",
  children,
}) {
  const navigate = useNavigate();

  return (
    <Paper elevation={0} className="p-5 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <Typography variant="subtitle1" className="font-semibold">
              {title}
              {typeof count === "number" && (
                <span className="ml-2 text-sm font-normal text-gray-500">({count})</span>
              )}
            </Typography>
            {subtitle && <p className="text-gray-500 text-xs">{subtitle}</p>}
          </div>
        </div>

        {action && state === "success" && (
          <Button size="small" onClick={() => navigate(action.to)} sx={{ textTransform: "none" }}>
            {action.label}
          </Button>
        )}
      </div>

      <div className="flex-1">
        {state === "loading" && (
          <div className="space-y-2">
            <Skeleton variant="rectangular" height={28} />
            <Skeleton variant="rectangular" height={28} />
            <Skeleton variant="rectangular" height={28} />
          </div>
        )}

        {state === "error" && (
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Couldn&apos;t load {error?.label || "this data"}
              {error?.status ? ` (${error.status})` : ""}.
            </p>
            {onRetry && (
              <Button size="small" onClick={onRetry} sx={{ textTransform: "none", px: 0 }}>
                Try again
              </Button>
            )}
          </div>
        )}

        {state === "success" && isEmpty && (
          <div className="py-4 flex items-center gap-2">
            {emptyTone === "good" && <CheckCircleIcon className="text-green-500" fontSize="small" />}
            <p className={`text-sm ${emptyTone === "good" ? "text-green-700" : "text-gray-500"}`}>
              {emptyMessage}
            </p>
          </div>
        )}

        {state === "success" && !isEmpty && children}
      </div>
    </Paper>
  );
}
