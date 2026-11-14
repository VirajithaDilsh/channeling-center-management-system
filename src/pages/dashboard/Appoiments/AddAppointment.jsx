import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { getDoctors, getDoctorAvailability } from "../../../api/DoctorApi";
import { DAY_SHORT } from "../../../utils/availability";
import { getPatients } from "../../../api/PatientApi";
import { createAppointment } from "../../../api/AppointmentApi";

const emptyState = {
  selectedDoctor: null,
  selectedPatient: null,
  slotKey: "",
  reason: ""
};

// "Mon, 2026-11-16 · 10:00–12:00 · 4 left"
const slotLabel = (s) => {
  const capacity = s.full ? "Fully booked" : s.remaining === null ? "open" : `${s.remaining} left`;
  return `${DAY_SHORT[s.dayOfWeek]}, ${s.date} \u00b7 ${s.startTime}\u2013${s.endTime} \u00b7 ${capacity}`;
};
const keyOf = (s) => `${s.date}|${s.scheduleId}`;

const AddAppointment = ({ open, onClose, onCreated, onError }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState(emptyState.selectedDoctor);
  const [selectedPatient, setSelectedPatient] = useState(emptyState.selectedPatient);
  const [slotKey, setSlotKey] = useState(emptyState.slotKey);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [reason, setReason] = useState(emptyState.reason);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    getDoctors()
      .then(setDoctors)
      .catch((err) => {
        console.error("Error fetching doctors:", err);
        onError("Could not load the doctor list. Please close and reopen this form.");
      });

    getPatients()
      .then(setPatients)
      .catch((err) => {
        console.error("Error fetching patients:", err);
        onError("Could not load the patient list. Please close and reopen this form.");
      });
  }, [open]);

  // Whenever the doctor changes, load the dates they're actually available.
  useEffect(() => {
    setSlotKey("");
    setSlots([]);
    setSlotsError("");
    if (!selectedDoctor) return;

    let cancelled = false;
    setSlotsLoading(true);
    getDoctorAvailability(selectedDoctor._id)
      .then((data) => {
        if (cancelled) return;
        if (data.onLeave) setSlotsError("This doctor is currently on leave.");
        else if (!data.dates.length) setSlotsError("This doctor has no available dates to book.");
        setSlots(data.onLeave ? [] : data.dates);
      })
      .catch((err) => {
        if (!cancelled) setSlotsError(err.response?.data?.message || "Could not load the doctor's availability.");
      })
      .finally(() => !cancelled && setSlotsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedDoctor]);

  const resetForm = () => {
    setSelectedDoctor(emptyState.selectedDoctor);
    setSelectedPatient(emptyState.selectedPatient);
    setSlotKey(emptyState.slotKey);
    setReason(emptyState.reason);
  };

  // "Busy" is a transient in-clinic state and still bookable for a future date,
  // but a doctor on leave shouldn't be offered at all.
  const bookableDoctors = doctors.filter((doc) => doc.status !== "On Leave");

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const slot = slots.find((s) => keyOf(s) === slotKey);
    if (!selectedDoctor || !selectedPatient || !slot) {
      onError("Please select a doctor, a patient, and an available date.");
      return;
    }
    if (slot.full) {
      onError("That slot is fully booked. Please choose another date.");
      return;
    }

    setLoading(true);
    try {
      await createAppointment({
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.name,
        date: slot.date,
        time: slot.startTime,
        reason
      });

      resetForm();
      onCreated();
    } catch (err) {
      console.error(err);
      onError(err.response?.data?.message || "Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <div className="flex items-center gap-2">
          <EventIcon className="text-blue-500" />
          <Typography variant="h6">New Appointment</Typography>
        </div>
      </DialogTitle>

      <DialogContent>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Autocomplete
            options={bookableDoctors}
            getOptionLabel={(doc) =>
              doc.name ? [doc.name, doc.specialization].filter(Boolean).join(" \u2014 ") : ""
            }
            value={selectedDoctor}
            onChange={(event, value) => setSelectedDoctor(value)}
            noOptionsText="No doctors available to book"
            renderInput={(params) => <TextField {...params} label="Select Doctor" />}
          />

          <Autocomplete
            options={patients}
            getOptionLabel={(p) => (p.name ? `${p.name} (${p.patientId})` : "")}
            value={selectedPatient}
            onChange={(event, value) => setSelectedPatient(value)}
            renderInput={(params) => <TextField {...params} label="Select Patient" />}
          />

          <TextField
            select
            label="Available Date & Time"
            className="col-span-2"
            fullWidth
            disabled={!selectedDoctor || slotsLoading || slots.length === 0}
            value={slotKey}
            onChange={(e) => setSlotKey(e.target.value)}
            error={Boolean(slotsError)}
            helperText={
              !selectedDoctor
                ? "Select a doctor to see their available dates"
                : slotsLoading
                ? "Loading availability..."
                : slotsError || "Only dates the doctor is available are shown"
            }
          >
            {slots.map((s) => (
              <MenuItem key={keyOf(s)} value={keyOf(s)} disabled={s.full}>
                {slotLabel(s)}
              </MenuItem>
            ))}
          </TextField>

          <TextField label="Reason" name="reason" multiline rows={2} className="col-span-2" fullWidth value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading || !slotKey}>
          {loading ? <CircularProgress size={20} /> : "Create Appointment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointment;
