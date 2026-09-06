// Permission helpers. Permissions are baked into the JWT at login and cached in
// localStorage, so a role change only takes effect after the user logs in again.

export const getUserPermissions = () => {
  try {
    return JSON.parse(localStorage.getItem("userPermissions") || "[]");
  } catch {
    return [];
  }
};

// Matches the any-of rule the backend's requirePermission uses, and the same
// check the sidebar applies to its links: holding any one of the listed keys
// grants access. A null/empty requirement means "no permission needed".
export const hasAny = (permissions, required) => {
  if (!required || required.length === 0) return true;
  const list = Array.isArray(required) ? required : [required];
  return list.some((p) => permissions.includes(p));
};

// Who is looking at the page, resolved synchronously so the dashboard can decide
// its layout before any request is issued.
export const getViewer = () => {
  const permissions = getUserPermissions();
  const role = localStorage.getItem("userRole") || "";

  const doctorId = localStorage.getItem("doctorId") || "";
  const doctorName = localStorage.getItem("doctorName") || "";

  // Whether to narrow clinical data to this person's own patients.
  //
  // NOT simply "holds doctor_portal": the admin role holds every permission
  // including doctor_portal, and an admin has no linked doctor profile — so
  // scoping on the permission alone filtered every appointment out and showed
  // an admin an empty schedule.
  //
  // Scope when they actually have a linked doctor profile, or when their role is
  // doctor but the link is missing. That second case deliberately shows nothing
  // rather than falling back to the whole clinic: an unlinked doctor account
  // seeing every doctor's patients is the leak worth erring against.
  const actsAsDoctor = Boolean(doctorId || doctorName) || role === "doctor";

  return {
    permissions,
    role,
    doctorId,
    doctorName,
    isDoctor: actsAsDoctor,
    hasDoctorProfile: Boolean(doctorId || doctorName),
    can: (required) => hasAny(permissions, required),
  };
};
