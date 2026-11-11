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
  CircularProgress
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { getDoctors } from "../../../api/DoctorApi";
import { getPatients } from "../../../api/PatientApi";
import { createAppointment } from "../../../api/AppointmentApi";

const emptyState = {
  selectedDoctor: null,
  selectedPatient: null,
  date: "",
  time: "",
  reason: ""
};

const AddAppointment = ({ open, onClose, onCreated, onError }) => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);

  const [selectedDoctor, setSelectedDoctor] = useState(emptyState.selectedDoctor);
  const [selectedPatient, setSelectedPatient] = useState(emptyState.selectedPatient);
  const [date, setDate] = useState(emptyState.date);
  const [time, setTime] = useState(emptyState.time);
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

  const resetForm = () => {
    setSelectedDoctor(emptyState.selectedDoctor);
    setSelectedPatient(emptyState.selectedPatient);
    setDate(emptyState.date);
    setTime(emptyState.time);
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
    if (!selectedDoctor || !selectedPatient || !date) {
      onError("Please select a doctor, a patient, and a date.");
      return;
    }

    setLoading(true);
    try {
      await createAppointment({
        doctorId: selectedDoctor._id,
        doctorName: selectedDoctor.name,
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.name,
        date,
        time,
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

          <TextField type="date" label="Date" fullWidth InputLabelProps={{ shrink: true }} value={date} onChange={(e) => setDate(e.target.value)} />

          <TextField type="time" label="Time" fullWidth InputLabelProps={{ shrink: true }} value={time} onChange={(e) => setTime(e.target.value)} />

          <TextField label="Reason" name="reason" multiline rows={2} className="col-span-2" fullWidth value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Create Appointment"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAppointment;
