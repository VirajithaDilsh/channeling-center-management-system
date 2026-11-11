import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { changeMyPassword } from "../../../api/AdminApi";

const emptyForm = { currentPassword: "", newPassword: "", confirmPassword: "" };

export default function SecurityTab({ showSnackbar }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword) {
      showSnackbar("Please fill in all password fields", "warning");
      return;
    }
    if (form.newPassword.length < 6) {
      showSnackbar("New password must be at least 6 characters", "warning");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      showSnackbar("New password and confirmation do not match", "warning");
      return;
    }

    setSaving(true);
    try {
      await changeMyPassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      showSnackbar("Password changed successfully");
      setForm(emptyForm);
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold mb-1">Change Password</h2>
      <p className="text-gray-500 text-sm mb-5">Update the password used to sign in to your account.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm text-gray-600">Current Password</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2 mt-1"
            value={form.currentPassword}
            onChange={handleChange("currentPassword")}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">New Password</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2 mt-1"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
          />
        </div>
        <div>
          <label className="text-sm text-gray-600">Confirm New Password</label>
          <input
            type="password"
            className="w-full border rounded-lg p-2 mt-1"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
          />
        </div>

        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={20} color="inherit" /> : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
