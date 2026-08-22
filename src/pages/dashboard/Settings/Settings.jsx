import React, { useMemo, useState } from "react";
import { Tabs, Tab, Snackbar, Alert } from "@mui/material";

import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import AvailabilityTab from "./AvailabilityTab";
import GeneralTab from "./GeneralTab";
import AppointmentsTab from "./AppointmentsTab";
import PaymentsTab from "./PaymentsTab";
import UsersRolesTab from "./UsersRolesTab";

export default function Settings() {
  const userRole = localStorage.getItem("userRole") || "";
  const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");

  const canManageSystemSettings = permissions.includes("settings_read") || permissions.includes("settings_allow_all");
  // Not permission-based: admin holds every permission key (including
  // doctor_portal) by design, but isn't an actual doctor with a Doctor profile.
  const isDoctor = userRole === "doctor";

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  // Every role gets Profile + Account & Security. Availability is doctor-only.
  // The system-level tabs only render for whoever holds the "settings" permission.
  const tabs = useMemo(() => {
    const list = [];
    if (canManageSystemSettings) {
      list.push({ key: "general", label: "General", component: GeneralTab });
      list.push({ key: "appointments", label: "Appointments", component: AppointmentsTab });
      list.push({ key: "payments", label: "Payments", component: PaymentsTab });
      list.push({ key: "usersRoles", label: "Users & Roles", component: UsersRolesTab });
    }
    list.push({ key: "profile", label: "Profile", component: ProfileTab });
    if (isDoctor) {
      list.push({ key: "availability", label: "Availability", component: AvailabilityTab });
    }
    list.push({ key: "security", label: "Account & Security", component: SecurityTab });
    return list;
  }, [canManageSystemSettings, isDoctor]);

  const [activeTab, setActiveTab] = useState(0);
  const ActiveComponent = tabs[activeTab]?.component;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and, if authorized, system-wide configuration</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <Tabs
          value={activeTab}
          onChange={(e, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>

        <div className="p-6">
          {ActiveComponent && <ActiveComponent role={userRole} showSnackbar={showSnackbar} />}
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
