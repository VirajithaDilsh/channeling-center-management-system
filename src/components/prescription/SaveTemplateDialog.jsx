import React, { useEffect, useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, TextField, Button } from "@mui/material";
import { createPrescriptionTemplate } from "../../api/PrescriptionTemplateApi";

const NAME_MAX = 80;

// Saves the given items as a new personal template. Never touches the
// consultation or the patient — `items` is only read.
export default function SaveTemplateDialog({ open, items, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setError("");
    }
  }, [open]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return setError("Template name is required");
    if (trimmed.length > NAME_MAX) return setError(`Template name must be at most ${NAME_MAX} characters`);

    setSaving(true);
    try {
      const saved = await createPrescriptionTemplate({
        name: trimmed,
        items: items.map((m) => ({
          medicineId: m.medicineId,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
          qtyPrescribed: Number(m.qtyPrescribed) || 1,
        })),
      });
      onSaved(saved);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Save as Template</DialogTitle>
      <DialogContent>
        <DialogContentText className="!mb-3">
          Saves the {items.length} medicine{items.length === 1 ? "" : "s"} in the current prescription as a reusable
          template. The patient and this consultation are not affected.
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Template name"
          placeholder="e.g. Common Fever"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
          error={!!error}
          helperText={error || `${name.trim().length}/${NAME_MAX}`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Template"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
