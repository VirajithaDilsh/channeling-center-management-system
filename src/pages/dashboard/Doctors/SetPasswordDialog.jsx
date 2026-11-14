import React, { useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { setDoctorPassword } from "../../../api/DoctorApi";

/**
 * Admin-only dialog to set a doctor's login password. It never shows an
 * existing password: it creates the login if there is none, otherwise resets it.
 */
export default function SetPasswordDialog({ doctor, onClose, onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setError("");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setSaving(true);
    try {
      const res = await setDoctorPassword(doctor._id, password);
      onDone(res.message || "Password saved");
    } catch (err) {
      setError(err.response?.data?.message || "Could not set the password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(doctor)} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{doctor?.hasAccount ? "Reset password" : "Create login"} &mdash; {doctor?.name}</DialogTitle>
      <DialogContent>
        <DialogContentText className="!mb-4">
          {doctor?.hasAccount
            ? "Enter a new password for this doctor. It replaces their current one."
            : "This doctor has no login yet. Enter a password to create one."}
        </DialogContentText>
        <div className="flex flex-col gap-4 pt-1">
          <TextField
            label="New password"
            type={show ? "text" : "password"}
            fullWidth
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"}>
                      {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            label="Confirm password"
            type={show ? "text" : "password"}
            fullWidth
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={Boolean(error)}
            helperText={error || "At least 6 characters"}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !password}>
          {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
