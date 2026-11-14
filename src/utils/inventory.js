// Inventory state helpers.
//
// stockQuantity and reorderLevel are bare, optional Numbers on the Medicine
// model, so older records carry neither. Every check below coerces and range-
// checks explicitly: the previous inline version (`med.reorderLevel && parseInt(
// med.stockQuantity) <= parseInt(med.reorderLevel)`) silently never fired,
// because a reorderLevel of 0 is falsy and parseInt(undefined) is NaN, which
// fails every comparison.

// "out"  – nothing left on the shelf
// "low"  – at or below the configured reorder level
// "ok"   – healthy, or no reorder level configured to judge against
export const stockState = (medicine) => {
  const stock = Number(medicine?.stockQuantity);
  if (!Number.isFinite(stock) || stock <= 0) return "out";

  const reorder = Number(medicine?.reorderLevel);
  if (!Number.isFinite(reorder) || reorder <= 0) return "ok";

  return stock <= reorder ? "low" : "ok";
};

export const isLowStock = (medicine) => stockState(medicine) !== "ok";

// How short a medicine is relative to its own reorder level, so a medicine 2 of
// 5 short sorts as more urgent than one 50 of 500 short.
export const stockShortfallRatio = (medicine) => {
  const stock = Number(medicine?.stockQuantity) || 0;
  const reorder = Number(medicine?.reorderLevel) || 0;
  if (reorder <= 0) return stock <= 0 ? 0 : Number.POSITIVE_INFINITY;
  return stock / reorder;
};

export const isExpiringSoon = (medicine, withinDays = 30) => {
  if (!medicine?.expiryDate) return false;
  const expiry = new Date(medicine.expiryDate);
  if (Number.isNaN(expiry.getTime())) return false;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);
  return expiry <= cutoff;
};

export const STOCK_STATE_LABELS = { out: "Out of stock", low: "Low", ok: "In stock" };
export const STOCK_STATE_COLORS = { out: "error", low: "warning", ok: "success" };

const COLOMBO_TZ = "Asia/Colombo";
const MS_PER_DAY = 86400000;

const colomboFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: COLOMBO_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export const getColomboDateParts = (dateInput = new Date()) => {
  if (!dateInput) return null;
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return null;

  const parts = colomboFormatter.formatToParts(date);
  let year;
  let month;
  let day;
  for (const part of parts) {
    if (part.type === "year") year = Number(part.value);
    else if (part.type === "month") month = Number(part.value);
    else if (part.type === "day") day = Number(part.value);
  }
  if (!year || !month || !day) return null;
  return { year, month, day };
};

export const formatColomboYmd = (dateInput) => {
  const parts = getColomboDateParts(dateInput);
  if (!parts) return "";
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
};

export const getDaysRemainingInColombo = (expiryDate, now = new Date()) => {
  const expiryParts = getColomboDateParts(expiryDate);
  const todayParts = getColomboDateParts(now);
  if (!expiryParts || !todayParts) return null;

  const expiryDay = Math.floor(Date.UTC(expiryParts.year, expiryParts.month - 1, expiryParts.day) / MS_PER_DAY);
  const todayDay = Math.floor(Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day) / MS_PER_DAY);
  return expiryDay - todayDay;
};

export const getExpiryStatus = (medicine, thresholdDays = 30) => {
  const daysRemaining = getDaysRemainingInColombo(medicine?.expiryDate);
  if (daysRemaining === null) return "NORMAL";

  const safeThreshold = Number.isFinite(Number(thresholdDays)) && Number(thresholdDays) >= 1
    ? Number(thresholdDays)
    : 30;

  if (daysRemaining < 0) return "EXPIRED";
  if (daysRemaining <= 7) return "URGENT";
  if (daysRemaining <= safeThreshold) return "EXPIRING_SOON";
  return "NORMAL";
};

export const EXPIRY_STATUS_LABELS = {
  EXPIRED: "Expired",
  URGENT: "Urgent",
  EXPIRING_SOON: "Expiring Soon",
  NORMAL: "Normal",
};

export const EXPIRY_STATUS_CLASSES = {
  EXPIRED: "text-red-700 bg-red-100",
  URGENT: "text-orange-700 bg-orange-100",
  EXPIRING_SOON: "text-amber-700 bg-amber-100",
  NORMAL: "text-emerald-700 bg-emerald-100",
};
