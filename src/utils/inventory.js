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
