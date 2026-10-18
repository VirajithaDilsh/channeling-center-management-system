// LKR display used by the finance pages. Matches the wording the assistant uses
// server-side so a figure reads the same in a tile and in a chat answer.
export const formatLkr = (value) =>
  `LKR ${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "2026-03" -> "Mar 2026"
export const formatMonth = (key) => {
  const m = /^(\d{4})-(\d{2})$/.exec(key || "");
  return m ? `${MONTHS[Number(m[2]) - 1]} ${m[1]}` : key || "";
};

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
