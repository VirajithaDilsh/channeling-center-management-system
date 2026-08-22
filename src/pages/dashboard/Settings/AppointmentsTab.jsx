import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { getSettings, updateSettings } from "../../../api/SettingsApi";

export default function AppointmentsTab({ showSnackbar }) {
  const [appointments, setAppointments] = useState(null);
  const [doctorDefaults, setDoctorDefaults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setAppointments(settings.appointments);
        setDoctorDefaults(settings.doctorDefaults);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAppointmentChange = (field) => (e) =>
    setAppointments((a) => ({ ...a, [field]: Number(e.target.value) }));

  const handleDoctorDefaultChange = (field) => (e) =>
    setDoctorDefaults((d) => ({ ...d, [field]: Number(e.target.value) }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSettings({ appointments, doctorDefaults });
      setAppointments(updated.appointments);
      setDoctorDefaults(updated.doctorDefaults);
      showSnackbar("Appointment settings saved");
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading settings...</p>;
  if (!appointments || !doctorDefaults) return null;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Booking Rules</h2>
        <p className="text-gray-500 text-sm mb-3">Applied when patients book or cancel a channeling appointment.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Default Appointment Duration (minutes)</label>
            <input
              type="number" min={5} className="w-full border rounded-lg p-2 mt-1"
              value={appointments.defaultDurationMinutes}
              onChange={handleAppointmentChange("defaultDurationMinutes")}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Max Advance Booking (days)</label>
            <input
              type="number" min={1} className="w-full border rounded-lg p-2 mt-1"
              value={appointments.maxAdvanceBookingDays}
              onChange={handleAppointmentChange("maxAdvanceBookingDays")}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Cancellation Window (hours before appointment)</label>
            <input
              type="number" min={0} className="w-full border rounded-lg p-2 mt-1"
              value={appointments.cancellationWindowHours}
              onChange={handleAppointmentChange("cancellationWindowHours")}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-1">Doctor Defaults</h2>
        <p className="text-gray-500 text-sm mb-3">Default consultation length used as guidance across the clinic.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Default Consultation Duration (minutes)</label>
            <input
              type="number" min={5} className="w-full border rounded-lg p-2 mt-1"
              value={doctorDefaults.defaultConsultationDurationMinutes}
              onChange={handleDoctorDefaultChange("defaultConsultationDurationMinutes")}
            />
          </div>
        </div>
      </div>

      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
      </Button>
    </div>
  );
}
