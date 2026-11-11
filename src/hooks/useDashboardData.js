import { useCallback, useEffect, useRef, useState } from "react";
import { getAppointments } from "../api/AppointmentApi";
import { getPatients } from "../api/PatientApi";
import { getDoctors } from "../api/DoctorApi";
import { getMedicines } from "../api/MedicineApi";
import { getPharmacyQueue } from "../api/PrescriptionApi";
import { listVisitSessions } from "../api/VisitSessionApi";
import { getAdmins } from "../api/AdminApi";
import { getViewer, hasAny } from "../utils/permissions";
import { belongsToDoctor } from "../utils/appointments";

// Each source mirrors one backend route guard. The `permissions` array is a
// verbatim copy of that route's requirePermission arguments — copy it rather
// than reasoning about it, because this list is the only thing preventing a
// low-privilege role (reception holds just doctors_read + appointments_read)
// from generating a wall of 403s on every dashboard load.
//
// scopeForViewer runs once when a source resolves, so every widget derived from
// it is scoped identically. Scoping here rather than per widget means a widget
// added later cannot accidentally leak another doctor's patients.
export const DASHBOARD_SOURCES = {
  appointments: {
    label: "appointments",
    permissions: ["appointments_read", "appointments_allow_all"],
    fetch: getAppointments,
    scopeForViewer: (rows, viewer) =>
      viewer.isDoctor ? rows.filter((a) => belongsToDoctor(a, viewer)) : rows,
  },
  visitSessions: {
    label: "billing",
    permissions: ["pharmacy_read", "pharmacy_allow_all", "billing_read", "billing_allow_all"],
    fetch: listVisitSessions,
  },
  pharmacyQueue: {
    label: "the pharmacy queue",
    permissions: ["pharmacy_read", "pharmacy_allow_all"],
    fetch: getPharmacyQueue,
  },
  medicines: {
    label: "inventory",
    permissions: ["inventory_read", "inventory_allow_all"],
    fetch: getMedicines,
  },
  patients: {
    label: "patients",
    permissions: ["patients_read", "patients_allow_all"],
    fetch: getPatients,
  },
  doctors: {
    label: "doctors",
    permissions: ["doctors_read", "doctors_allow_all"],
    fetch: getDoctors,
  },
  staff: {
    label: "staff accounts",
    permissions: ["admin_read", "admin_allow_all"],
    fetch: getAdmins,
  },
};

const skipped = { status: "skipped", data: null, error: null };
const loading = { status: "loading", data: null, error: null };

const initialState = () => {
  const viewer = getViewer();
  return Object.fromEntries(
    Object.entries(DASHBOARD_SOURCES).map(([key, source]) => [
      key,
      hasAny(viewer.permissions, source.permissions) ? loading : skipped,
    ])
  );
};

// Owns every dashboard request. Widgets are presentational and receive data as
// props, so two widgets reading appointments cause one fetch rather than two.
export default function useDashboardData() {
  const [viewer] = useState(getViewer);
  const [sources, setSources] = useState(initialState);
  const [lastLoadedAt, setLastLoadedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // StrictMode double-invokes effects in development, which would double every
  // full-collection fetch. The generation counter makes stale responses inert.
  const generation = useRef(0);

  const load = useCallback(
    async (keys) => {
      const current = ++generation.current;
      const permitted = keys.filter((key) =>
        hasAny(viewer.permissions, DASHBOARD_SOURCES[key].permissions)
      );

      setSources((prev) => ({
        ...prev,
        ...Object.fromEntries(permitted.map((key) => [key, { ...loading }])),
      }));

      // allSettled, so one 403 or outage cannot blank the whole page, and each
      // source commits as it lands rather than waiting on the slowest.
      await Promise.allSettled(
        permitted.map(async (key) => {
          const source = DASHBOARD_SOURCES[key];
          try {
            const raw = await source.fetch();
            const rows = Array.isArray(raw) ? raw : [];
            const data = source.scopeForViewer ? source.scopeForViewer(rows, viewer) : rows;
            if (generation.current !== current) return;
            setSources((prev) => ({ ...prev, [key]: { status: "success", data, error: null } }));
          } catch (err) {
            if (generation.current !== current) return;
            // A 403 here means this table has drifted from the route's guard —
            // the permission check above should have skipped the request.
            if (err?.response?.status === 403) {
              console.warn(`Dashboard source "${key}" was refused; its permission list may be stale.`);
            }
            setSources((prev) => ({
              ...prev,
              [key]: {
                status: "error",
                data: null,
                error: { status: err?.response?.status, label: source.label },
              },
            }));
          }
        })
      );

      if (generation.current === current) setLastLoadedAt(new Date());
    },
    [viewer]
  );

  useEffect(() => {
    load(Object.keys(DASHBOARD_SOURCES));
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(Object.keys(DASHBOARD_SOURCES));
    setRefreshing(false);
  }, [load]);

  const refreshSource = useCallback((key) => load([key]), [load]);

  return { viewer, sources, lastLoadedAt, refreshing, refresh, refreshSource };
}
