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

export const clearSession = () => {
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};
