// VisitSession money helpers.
//
// The backend's VisitSession.totalDue() is a Mongoose instance method, so it is
// absent from every JSON response — the balance has to be recomputed here. The
// rounding deliberately matches the model's so a figure shown in the UI always
// equals what the payment endpoint will accept.
//
// Every reducer guards its array and coerces its numbers: these run over whole
// collections including records written before fields were required, and one
// document with no lineItems would otherwise throw and blank the whole card.

const sumField = (rows, field) =>
  (Array.isArray(rows) ? rows : []).reduce((total, row) => total + (Number(row?.[field]) || 0), 0);

export const totalOf = (session) => sumField(session?.lineItems, "amount");

export const paidOf = (session) => sumField(session?.payments, "amount");

export const balanceOf = (session) =>
  Math.max(0, Math.round((totalOf(session) - paidOf(session)) * 100) / 100);

// Line items of one type, e.g. medication charges vs consultation fees.
export const totalOfType = (session, type) =>
  sumField(
    (Array.isArray(session?.lineItems) ? session.lineItems : []).filter((li) => li?.type === type),
    "amount"
  );

export const SESSION_STATUS_LABELS = {
  OPEN: "In consultation",
  PENDING_PHARMACY: "At pharmacy",
  READY_FOR_PAYMENT: "Ready to collect",
  CLOSED: "Paid",
  CANCELED: "Cancelled",
};

export const SESSION_STATUS_COLORS = {
  OPEN: "default",
  PENDING_PHARMACY: "warning",
  READY_FOR_PAYMENT: "info",
  CLOSED: "success",
  CANCELED: "error",
};
