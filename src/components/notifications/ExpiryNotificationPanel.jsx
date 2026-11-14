import React from "react";
import {
  Popover,
  Button,
  Chip,
  Divider,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { formatColomboYmd } from "../../utils/inventory";

const STATUS_BADGE = {
  EXPIRED: { label: "EXPIRED", color: "error" },
  URGENT: { label: "URGENT", color: "warning" },
  EXPIRING_SOON: { label: "EXPIRING SOON", color: "info" },
};

const PRIORITY_BADGE = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-amber-100 text-amber-700",
};

function formatDaysLabel(daysRemaining) {
  if (daysRemaining < 0) {
    const days = Math.abs(daysRemaining);
    return `Expired ${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (daysRemaining === 0) return "Expires today";
  return `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`;
}

const ExpiryNotificationPanel = ({
  anchorEl,
  open,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkRead,
  onMarkAllRead,
  onViewInventory,
}) => {
  return (
    <Popover
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          width: { xs: 340, sm: 420 },
          maxHeight: 520,
          borderRadius: 2,
          mt: 1,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Inventory Expiry Alerts
          </h3>
          <p className="text-xs text-slate-500">
            {unreadCount} unread alert{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<DoneAllIcon fontSize="small" />}
            onClick={onMarkAllRead}
          >
            Mark All Read
          </Button>
        )}
      </div>

      <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
        {loading ? (
          <div className="py-10 flex justify-center">
            <CircularProgress size={24} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-10 px-4 text-center text-sm text-slate-500">
            No expired or expiring medicines found.
          </div>
        ) : (
          notifications.map((item) => {
            const statusMeta = STATUS_BADGE[item.status] || {
              label: item.status,
              color: "default",
            };
            const priorityClass =
              PRIORITY_BADGE[item.priority] || "bg-slate-100 text-slate-700";

            return (
              <div
                key={item.id}
                className={`p-3.5 transition-colors ${
                  item.isRead ? "bg-white opacity-75" : "bg-sky-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Batch: {item.batchNumber || "—"} &bull; Stock:{" "}
                      {item.stockQuantity} {item.unitType || ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Chip
                      label={statusMeta.label}
                      color={statusMeta.color}
                      size="small"
                      sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">
                      Exp: {item.expiryYmd || formatColomboYmd(item.expiryDate)}
                    </span>
                    <span className="font-medium text-slate-700">
                      ({formatDaysLabel(item.daysRemaining)})
                    </span>
                  </div>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${priorityClass}`}
                  >
                    {item.priority}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center justify-end gap-2">
                  {!item.isRead && (
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<CheckIcon fontSize="small" />}
                      onClick={() => onMarkRead(item.id)}
                      sx={{ fontSize: "0.75rem", py: 0.25 }}
                    >
                      Mark as Read
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Inventory2OutlinedIcon fontSize="small" />}
                    onClick={() => onViewInventory(item)}
                    sx={{ fontSize: "0.75rem", py: 0.25 }}
                  >
                    View Inventory
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Divider />
      <div className="p-2.5 bg-slate-50 flex justify-end">
        <Button
          size="small"
          fullWidth
          variant="contained"
          onClick={() => onViewInventory()}
        >
          Open Medicine Inventory
        </Button>
      </div>
    </Popover>
  );
};

export default ExpiryNotificationPanel;

