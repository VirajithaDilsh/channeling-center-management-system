import React, { useEffect, useState } from "react";
import { Button, CircularProgress, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { getSettings, updateSettings } from "../../../api/SettingsApi";

const PAYMENT_METHODS = [
  { key: "cash", label: "Cash" },
  { key: "card", label: "Card" },
  { key: "insurance", label: "Insurance" },
];

export default function PaymentsTab({ showSnackbar }) {
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getSettings();
        setPayments(settings.payments);
      } catch (err) {
        console.error(err);
        showSnackbar("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleMethod = (key) => {
    setPayments((p) => {
      const has = p.enabledPaymentMethods.includes(key);
      const next = has
        ? p.enabledPaymentMethods.filter((m) => m !== key)
        : [...p.enabledPaymentMethods, key];
      return { ...p, enabledPaymentMethods: next };
    });
  };

  const handleSave = async () => {
    if (payments.enabledPaymentMethods.length === 0) {
      showSnackbar("At least one payment method must be enabled", "warning");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateSettings({ payments });
      setPayments(updated.payments);
      showSnackbar("Payment settings saved");
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading settings...</p>;
  if (!payments) return null;

  return (
    <div className="max-w-lg space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Currency Symbol</label>
          <input
            className="w-full border rounded-lg p-2 mt-1"
            value={payments.currencySymbol}
            onChange={(e) => setPayments((p) => ({ ...p, currencySymbol: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Channeling Center Fee</label>
          <input
            type="number" min={0}
            className="w-full border rounded-lg p-2 mt-1"
            value={payments.centerFee}
            onChange={(e) => setPayments((p) => ({ ...p, centerFee: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-400 mt-1">Flat fee added to every booking, on top of the doctor's consultation fee.</p>
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600 block mb-1">Enabled Payment Methods</label>
        <FormGroup row>
          {PAYMENT_METHODS.map(({ key, label }) => (
            <FormControlLabel
              key={key}
              control={<Checkbox checked={payments.enabledPaymentMethods.includes(key)} onChange={() => toggleMethod(key)} />}
              label={label}
            />
          ))}
        </FormGroup>
      </div>

      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
      </Button>
    </div>
  );
}
