import React, { useEffect, useState } from "react";
import { Button, CircularProgress, Switch, FormControlLabel } from "@mui/material";
import { getSettings, updateSettings } from "../../../api/SettingsApi";

const DEFAULT_PREFS = {
  enabled: true,
  thresholdDays: 30,
  showLoginPopup: true,
  soundEnabled: false,
};

export default function NotificationsTab({ showSnackbar }) {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setPrefs({ ...DEFAULT_PREFS, ...(settings.inventoryNotifications || {}) });
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load notification settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [showSnackbar]);

  const handleToggle = (field) => (e) => {
    setPrefs((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const handleThresholdChange = (e) => {
    setPrefs((prev) => ({ ...prev, thresholdDays: Number(e.target.value) }));
  };

  const handleSave = async () => {
    if (!Number.isInteger(prefs.thresholdDays) || prefs.thresholdDays < 1 || prefs.thresholdDays > 365) {
      showSnackbar("Warning threshold must be a whole number between 1 and 365 days", "error");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateSettings({ inventoryNotifications: prefs });
      setPrefs({ ...DEFAULT_PREFS, ...(updated.inventoryNotifications || {}) });
      showSnackbar("Notification preferences saved");
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save notification preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading settings...</p>;
  if (!prefs) return null;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Inventory Expiry Notifications</h2>
        <p className="text-gray-500 text-sm mb-4">
          Configure administrator alerts for expired and soon-to-expire medicine batches.
        </p>

        <div className="space-y-4">
          <FormControlLabel
            control={<Switch checked={Boolean(prefs.enabled)} onChange={handleToggle("enabled")} />}
            label="Enable inventory expiry notifications"
          />

          <div>
            <label className="block text-sm text-gray-600">
              Warning Threshold (days before expiry)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              className="w-full max-w-xs border rounded-lg p-2 mt-1"
              value={prefs.thresholdDays}
              onChange={handleThresholdChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              Medicines expiring within 0–7 days are marked Urgent; 8–{prefs.thresholdDays || 30} days are marked Expiring Soon.
            </p>
          </div>

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(prefs.showLoginPopup)}
                onChange={handleToggle("showLoginPopup")}
              />
            }
            label="Show popup on administrator login when unread alerts exist"
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(prefs.soundEnabled)}
                onChange={handleToggle("soundEnabled")}
              />
            }
            label="Play notification sound"
          />
        </div>
      </div>

      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
      </Button>
    </div>
  );
}

