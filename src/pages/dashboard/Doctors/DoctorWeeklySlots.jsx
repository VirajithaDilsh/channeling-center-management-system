import React, { useState } from "react";
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, CircularProgress, MenuItem, Snackbar, Alert,
} from "@mui/material";
import TableActionButtons from "../../../components/TableActionButton";
import { addDoctorSchedule, updateDoctorSchedule, deleteDoctorSchedule } from "../../../api/DoctorApi";
import { DAY_NAMES, DAY_ORDER, maxLabel } from "../../../utils/availability";

const emptyForm = { dayOfWeek: "", startTime: "", endTime: "", maxPatients: "" };

/**
 * Weekly availability section for the doctor details page (rendered inside the Availability card).
 * Everyone who can view the doctor sees the slots; adding needs `canWrite`,
 * editing/removing needs `canEdit` (matching the backend permissions).
 */
export default function DoctorWeeklySlots({ doctorId, schedule = [], canWrite, canEdit, onChanged }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const notify = (message, severity = "success") => setSnack({ open: true, message, severity });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (w) => {
    setEditingId(w._id);
    setForm({
      dayOfWeek: w.dayOfWeek,
      startTime: w.startTime,
      endTime: w.endTime,
      maxPatients: w.maxPatients ?? "",
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (form.dayOfWeek === "" || !form.startTime || !form.endTime) {
      notify("Please choose a day, start time and end time", "warning");
      return;
    }
    if (form.endTime <= form.startTime) {
      notify("End time must be after start time", "warning");
      return;
    }

    setSaving(true);
    try {
      // Blank max patients = no limit (sent as null).
      const payload = {
        dayOfWeek: Number(form.dayOfWeek),
        startTime: form.startTime,
        endTime: form.endTime,
        maxPatients: form.maxPatients === "" ? null : Number(form.maxPatients),
      };
      if (editingId) {
        await updateDoctorSchedule(editingId, payload);
        notify("Availability slot updated");
      } else {
        await addDoctorSchedule(doctorId, payload);
        notify("Availability slot added");
      }
      setFormOpen(false);
      onChanged();
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.message || "Failed to save availability slot", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoctorSchedule(deleteId);
      notify("Availability slot removed");
      onChanged();
    } catch (err) {
      console.error(err);
      notify("Failed to remove availability slot", "error");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">Weekly Availability</h4>
          <p className="text-sm text-gray-500">Days and times patients can book this doctor</p>
        </div>
        {canWrite && (
          <Button variant="contained" size="small" onClick={openCreate} sx={{ textTransform: "none" }}>
            + Add Slot
          </Button>
        )}
      </div>

      {schedule.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {DAY_ORDER.filter((d) => schedule.some((w) => w.dayOfWeek === d)).map((d) => (
            <div key={d} className="border border-gray-100 rounded-lg px-4 py-3">
              <div className="font-medium text-gray-800 mb-1">{DAY_NAMES[d]}</div>
              {schedule
                .filter((w) => w.dayOfWeek === d)
                .map((w) => (
                  <div key={w._id} className="flex items-center justify-between gap-2 text-sm text-gray-600">
                    <span>
                      {w.startTime}&ndash;{w.endTime} &middot; {maxLabel(w)}
                    </span>
                    {canEdit && (
                      <TableActionButtons onEdit={() => openEdit(w)} onDelete={() => setDeleteId(w._id)} />
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No weekly availability set yet.</p>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Availability Slot" : "Add Availability Slot"}</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <TextField
              select label="Day" fullWidth
              value={form.dayOfWeek} onChange={(e) => setForm((f) => ({ ...f, dayOfWeek: e.target.value }))}
            >
              {DAY_ORDER.map((d) => <MenuItem key={d} value={d}>{DAY_NAMES[d]}</MenuItem>)}
            </TextField>
            <TextField
              type="number" label="Max Patients (optional)" fullWidth
              slotProps={{ htmlInput: { min: 1 } }}
              helperText="Leave blank for no limit"
              value={form.maxPatients} onChange={(e) => setForm((f) => ({ ...f, maxPatients: e.target.value }))}
            />
            <TextField
              type="time" label="Start Time" fullWidth slotProps={{ inputLabel: { shrink: true } }}
              value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
            <TextField
              type="time" label="End Time" fullWidth slotProps={{ inputLabel: { shrink: true } }}
              value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Remove Availability Slot</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to remove this availability slot?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Remove</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
