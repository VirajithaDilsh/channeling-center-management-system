import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { formatColomboYmd } from "../../utils/inventory";

const STATUS_COLOR = {
  EXPIRED: "error",
  URGENT: "warning",
  EXPIRING_SOON: "info",
};

const ExpiryAlertPopup = ({
  open,
  notifications,
  onDismiss,
  onViewInventory,
}) => {
  const unreadAlerts = (notifications || []).filter((n) => !n.isRead);
  const preview = unreadAlerts.slice(0, 8);
  const remainingCount = unreadAlerts.length - preview.length;

  return (
    <Dialog open={open} onClose={onDismiss} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <WarningAmberRoundedIcon color="warning" />
        <span>Inventory Expiry Alert ({unreadAlerts.length})</span>
      </DialogTitle>

      <DialogContent dividers>
        <p className="text-sm text-slate-600 mb-3">
          The following medicines in inventory are expired or approaching expiry:
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {preview.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 bg-slate-50"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">
                  Batch: {item.batchNumber || "—"} &bull; Exp:{" "}
                  {item.expiryYmd || formatColomboYmd(item.expiryDate)} &bull;
                  Stock: {item.stockQuantity} {item.unitType || ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Chip
                  label={item.status.replace("_", " ")}
                  color={STATUS_COLOR[item.status] || "default"}
                  size="small"
                />
              </div>
            </div>
          ))}
        </div>

        {remainingCount > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            + {remainingCount} more alert{remainingCount === 1 ? "" : "s"} in the
            notification panel.
          </p>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onDismiss} color="inherit">
          Dismiss
        </Button>
        <Button variant="contained" onClick={onViewInventory}>
          View Inventory
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpiryAlertPopup;

