// Phone numbers are digits only, 10 digits (e.g. 0771234567).
export const PHONE_LENGTH = 10;

// Strips everything except digits and caps the length (use in onChange).
export const digitsOnly = (value) => String(value ?? "").replace(/\D/g, "").slice(0, PHONE_LENGTH);

// Returns an error message, or "" when empty (optional field) or valid.
export const phoneError = (value) => {
  const v = String(value ?? "").trim();
  if (!v) return "";
  return /^\d+$/.test(v) && v.length === PHONE_LENGTH
    ? ""
    : `Phone number must be ${PHONE_LENGTH} digits (numbers only)`;
};
