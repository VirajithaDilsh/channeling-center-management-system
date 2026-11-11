import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  TextField, CircularProgress,
} from "@mui/material";
import TableActionButtons from "../../../components/TableActionButton";
import { getMySchedules, addMySchedule, updateMySchedule, deleteMySchedule } from "../../../api/DoctorApi";

const emptyForm = { date: "", startTime: "", endTime: "", maxPatients: "" };

export default function AvailabilityTab({ showSnackbar }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteId, setDeleteId] = useState(null);

  const fetchSchedules = async () => {
    try {
      const data = await getMySchedules();
      setSchedules(data);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load your availability", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (schedule) => {
    setEditingId(schedule._id);
    setForm({
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxPatients: schedule.maxPatients,
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.date || !form.startTime || !form.endTime || !form.maxPatients) {
      showSnackbar("Please fill in date, start time, end time, and max patients", "warning");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, maxPatients: Number(form.maxPatients) };
      if (editingId) {
        await updateMySchedule(editingId, payload);
        showSnackbar("Availability slot updated");
      } else {
        await addMySchedule(payload);
        showSnackbar("Availability slot added");
      }
      setFormOpen(false);
      fetchSchedules();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save availability slot", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMySchedule(deleteId);
      showSnackbar("Availability slot removed");
      fetchSchedules();
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to remove availability slot", "error");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading availability...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Availability</h2>
          <p className="text-gray-500 text-sm">Add the dates and time slots you're available for consultations.</p>
        </div>
        <Button variant="contained" onClick={openCreateForm}>+ Add Slot</Button>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Max Patients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">No availability slots yet</TableCell>
              </TableRow>
            )}
            {schedules.map((s) => (
              <TableRow key={s._id} hover>
                <TableCell>{s.date}</TableCell>
                <TableCell>{s.startTime}</TableCell>
                <TableCell>{s.endTime}</TableCell>
                <TableCell>{s.maxPatients}</TableCell>
                <TableCell>{s.status}</TableCell>
                <TableCell>
                  <TableActionButtons onEdit={() => openEditForm(s)} onDelete={() => setDeleteId(s._id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? "Edit Availability Slot" : "Add Availability Slot"}</DialogTitle>
        <DialogContent>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <TextField
              type="date" label="Date" fullWidth InputLabelProps={{ shrink: true }}
              value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
            <TextField
              type="number" label="Max Patients" fullWidth
              value={form.maxPatients} onChange={(e) => setForm((f) => ({ ...f, maxPatients: e.target.value }))}
            />
            <TextField
              type="time" label="Start Time" fullWidth InputLabelProps={{ shrink: true }}
              value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
            />
            <TextField
              type="time" label="End Time" fullWidth InputLabelProps={{ shrink: true }}
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
    </div>
  );
}
