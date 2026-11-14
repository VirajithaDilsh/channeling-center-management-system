// Every localStorage key the login flow writes. Kept in one place so logging
// out clears all of them: dropping only the token/role/permissions used to
// leave doctorId and doctorName behind, and the doctor portal filters
// appointments by those — so the next person to log in on the same browser
// could inherit the previous doctor's identity.
const SESSION_KEYS = [
  "authToken",
  "userRole",
  "userPermissions",
  "doctorId",
  "doctorName",
];

const POPUP_DISMISS_PREFIX = "expiryPopupDismissed:";

// Derives a safe per-login-session storage key using only non-sensitive JWT
// claims (admin id + issued-at timestamp). Never stores raw JWT tokens or
// signatures in sessionStorage.
export const getPopupSessionDismissKey = () => {
  const token = localStorage.getItem("authToken");
  if (!token) return null;
  try {
    const payloadB64 = token.split(".")[1];
    if (!payloadB64) return null;
    const normalized = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized));
    const adminId = payload?.id || "unknown";
    const iat = payload?.iat || "session";
    return `${POPUP_DISMISS_PREFIX}${adminId}:${iat}`;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(POPUP_DISMISS_PREFIX)) {
        sessionStorage.removeItem(k);
      }
    }
  } catch {
    // Ignore storage access errors
  }
};
