import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { getSettings, updateSettings } from "../../../api/SettingsApi";

const FIELDS = [
  { key: "centerName", label: "Channeling Center Name" },
  { key: "contactNumber", label: "Contact Number" },
  { key: "email", label: "Email" },
  { key: "website", label: "Website" },
  { key: "logoUrl", label: "Logo URL" },
];

export default function GeneralTab({ showSnackbar }) {
  const [general, setGeneral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setGeneral(settings.general);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field) => (e) => setGeneral((g) => ({ ...g, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateSettings({ general });
      setGeneral(updated.general);
      showSnackbar("General settings saved");
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading settings...</p>;
  if (!general) return null;

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-gray-500 text-sm mb-2">
        This information appears on the login page and top navigation, and is used as the clinic's contact details.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map(({ key, label }) => (
          <div key={key} className={key === "address" ? "col-span-2" : ""}>
            <label className="text-sm text-gray-600">{label}</label>
            <input className="w-full border rounded-lg p-2 mt-1" value={general[key] || ""} onChange={handleChange(key)} />
          </div>
        ))}
        <div className="col-span-2">
          <label className="text-sm text-gray-600">Address</label>
          <textarea
            className="w-full border rounded-lg p-2 mt-1"
            rows={2}
            value={general.address || ""}
            onChange={handleChange("address")}
          />
        </div>
      </div>
      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
      </Button>
    </div>
  );
}
