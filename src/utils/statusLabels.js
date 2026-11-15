// Plain-language labels for statuses that are stored as internal codes.
export const VISIT_STATUS_LABELS = {
  OPEN: "In consultation",
  PENDING_PHARMACY: "At pharmacy",
  READY_FOR_PAYMENT: "Ready for payment",
  CLOSED: "Paid",
  CANCELED: "Cancelled",
};

export const DISPENSE_STATUS_LABELS = {
  QUEUED: "Waiting",
  DISPENSED: "Dispensed",
  PARTIAL: "Partly dispensed",
  REJECTED: "Rejected",
  CANCELED: "Cancelled",
};

export const EXPIRY_ALERT_LABELS = {
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
};

export const labelFor = (map, code) =>
  map[code] || String(code ?? "").replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
