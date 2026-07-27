import React, { useEffect, useState } from "react";
import {
  TextField, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Snackbar, Alert, Button, IconButton, Autocomplete
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import BackButton from "../../../components/BackButton";
import AddButton from "../../../components/AddButton";
import { getAppointments, updateAppointment } from "../../../api/AppointmentApi";
import { getPatientById } from "../../../api/PatientApi";
import { getChannelingHistory } from "../../../api/ChannelingApi";
import { getPrescriptionsByPatient, createPrescription } from "../../../api/PrescriptionApi";
import { getMedicines } from "../../../api/MedicineApi";
import { getVisitSessionByAppointment, finalizeConsultation } from "../../../api/VisitSessionApi";

const emptyMedicine = { medicineId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "", qtyPrescribed: 1 };

export default function Consultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [channelingHistory, setChannelingHistory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);
  const [visitSession, setVisitSession] = useState(null);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);

  const [savingPrescription, setSavingPrescription] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const doctorId = localStorage.getItem("doctorId");
  const doctorName = localStorage.getItem("doctorName");

  useEffect(() => {
    loadAppointmentAndPatient();
  }, [appointmentId]);

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const loadAppointmentAndPatient = async () => {
    try {
      const all = await getAppointments();
      const found = all.find((a) => a._id === appointmentId);
      if (!found) {
        showSnackbar("Appointment not found", "error");
        return;
      }
      setAppointment(found);

      const [patientData, history] = await Promise.all([
        getPatientById(found.patientId),
        getChannelingHistory(found.patientId).catch(() => []),
      ]);
      setPatient(patientData);
      setChannelingHistory(history || []);

      try {
        const patientPrescriptions = await getPrescriptionsByPatient(found.patientId);
        setPrescriptions(patientPrescriptions || []);
      } catch (err) {
        console.error("Could not load prescriptions:", err);
      }

      try {
        const session = await getVisitSessionByAppointment(appointmentId);
        setVisitSession(session);
      } catch (err) {
        console.error("Could not load visit session:", err);
      }

      try {
        const meds = await getMedicines();
        setMedicineOptions(meds || []);
      } catch (err) {
        console.error("Could not load medicine list:", err);
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load consultation details", "error");
    }
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const handleMedicineSelect = (index, selected) => {
    setMedicines((prev) => prev.map((m, i) => (i === index
      ? { ...m, medicineId: selected?._id || "", name: selected?.name || "" }
      : m)));
  };

  const addMedicineRow = () => setMedicines((prev) => [...prev, { ...emptyMedicine }]);

  const removeMedicineRow = (index) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePrescription = async () => {
    const validMedicines = medicines.filter((m) => m.medicineId);
    if (!diagnosis.trim() || validMedicines.length === 0) {
      showSnackbar("Add a diagnosis and at least one medicine.", "error");
      return;
    }

    setSavingPrescription(true);
    try {
      await createPrescription({
        appointmentId,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        doctorId,
        doctorName,
        diagnosis,
        notes,
        items: validMedicines.map((m) => ({
          medicineId: m.medicineId,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
          qtyPrescribed: Number(m.qtyPrescribed) || 1,
        })),
      });
      showSnackbar("Prescription saved and queued to the pharmacy.", "success");
      setDiagnosis("");
      setNotes("");
      setMedicines([{ ...emptyMedicine }]);
      const patientPrescriptions = await getPrescriptionsByPatient(appointment.patientId).catch(() => []);
      setPrescriptions(patientPrescriptions || []);
      const session = await getVisitSessionByAppointment(appointmentId).catch(() => null);
      if (session) setVisitSession(session);
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save prescription. Please try again.", "error");
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleCompleteAppointment = async () => {
    setCompleting(true);
    try {
      await updateAppointment(appointmentId, { ...appointment, status: "Completed" });
      if (visitSession?._id) {
        // If no prescription was queued, this moves the ledger straight to
        // READY_FOR_PAYMENT. If pharmacy items are queued, it stays
        // PENDING_PHARMACY and resolves itself once dispensing is done.
        await finalizeConsultation(visitSession._id).catch((err) =>
          console.error("Could not finalize visit session:", err)
        );
      }
      showSnackbar("Appointment marked as completed.", "success");
      setTimeout(() => navigate("/dashboard/doctor-home"), 800);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to close appointment.", "error");
    } finally {
      setCompleting(false);
    }
  };

  if (!appointment || !patient) {
    return <p className="p-6">Loading consultation...</p>;
  }

  const isCompleted = appointment.status === "Completed";

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BackButton to="/dashboard/doctor-home" />
          <div>
            <Typography variant="h5" className="font-semibold">Consultation</Typography>
            <p className="text-gray-500">
              {appointment.time ? `${appointment.time} • ` : ""}{appointment.reason || "General visit"}
            </p>
          </div>
        </div>
        {!isCompleted && (
          <Button
            variant="contained"
            color="success"
            onClick={handleCompleteAppointment}
            disabled={completing}
          >
            {completing ? "Closing..." : "Complete Appointment"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 space-y-6">
          {/* Patient Details */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <PersonIcon className="text-blue-500" />
              <Typography variant="h6">Patient Details</Typography>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Patient Name" value={patient.name || ""} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Contact" value={patient.phone || ""} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Age" value={patient.age || ""} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Gender" value={patient.gender || ""} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Blood Group" value={patient.blood || ""} fullWidth InputProps={{ readOnly: true }} />
              <TextField label="Address" value={patient.address || ""} multiline rows={2} fullWidth InputProps={{ readOnly: true }} className="col-span-2" />
            </div>
          </Paper>

          {/* Channeling History */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MedicalInformationIcon className="text-red-500" />
              <Typography variant="h6">Visit History</Typography>
            </div>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Doctor</TableCell>
                    <TableCell>Disease</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {channelingHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-gray-500">No visits recorded yet.</TableCell>
                    </TableRow>
                  )}
                  {channelingHistory.map((v) => (
                    <TableRow key={v._id}>
                      <TableCell>{v.recordedAt ? new Date(v.recordedAt).toLocaleString() : "-"}</TableCell>
                      <TableCell>{v.doctor || "-"}</TableCell>
                      <TableCell>{v.disease || "-"}</TableCell>
                      <TableCell>{v.notes || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Past Prescriptions */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptLongIcon className="text-purple-500" />
              <Typography variant="h6">Past Prescriptions</Typography>
            </div>
            {prescriptions.length === 0 && (
              <p className="text-gray-500 text-sm">No prescriptions on file for this patient.</p>
            )}
            {prescriptions.map((p) => (
              <div key={p._id} className="border-b last:border-0 py-3">
                <p className="text-sm text-gray-500">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""} • Dr. {p.doctorName} • {p.diagnosis}
                  {" • "}
                  <span className={p.status === "RESOLVED" ? "text-green-600" : "text-amber-600"}>
                    {p.status === "RESOLVED" ? "Resolved" : "Pending at pharmacy"}
                  </span>
                </p>
                <p className="text-sm">
                  {(p.items || []).map((m) => `${m.name} (${m.status})`).join(", ")}
                </p>
              </div>
            ))}
          </Paper>

          {/* New Prescription */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptLongIcon className="text-blue-500" />
              <Typography variant="h6">New Prescription</Typography>
            </div>

            <TextField
              label="Diagnosis"
              fullWidth
              className="mb-4"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={isCompleted}
            />

            <div className="space-y-3 mb-3">
              {medicines.map((m, i) => {
                const selectedMedicine = medicineOptions.find((opt) => opt._id === m.medicineId) || null;
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <Autocomplete
                      className="col-span-3"
                      size="small"
                      options={medicineOptions}
                      getOptionLabel={(opt) => opt.name ? `${opt.name} (${opt.stockQuantity} in stock)` : ""}
                      value={selectedMedicine}
                      disabled={isCompleted}
                      onChange={(event, value) => handleMedicineSelect(i, value)}
                      renderInput={(params) => <TextField {...params} label="Medicine" />}
                    />
                    <TextField className="col-span-1" label="Qty" type="number" size="small" value={m.qtyPrescribed} disabled={isCompleted}
                      inputProps={{ min: 1 }}
                      onChange={(e) => handleMedicineChange(i, "qtyPrescribed", e.target.value)} />
                    <TextField className="col-span-2" label="Dosage" size="small" value={m.dosage} disabled={isCompleted}
                      onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)} />
                    <TextField className="col-span-2" label="Frequency" size="small" value={m.frequency} disabled={isCompleted}
                      onChange={(e) => handleMedicineChange(i, "frequency", e.target.value)} />
                    <TextField className="col-span-2" label="Duration" size="small" value={m.duration} disabled={isCompleted}
                      onChange={(e) => handleMedicineChange(i, "duration", e.target.value)} />
                    <TextField className="col-span-1" label="Instructions" size="small" value={m.instructions} disabled={isCompleted}
                      onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)} />
                    <IconButton className="col-span-1" size="small" color="error" disabled={isCompleted || medicines.length === 1}
                      onClick={() => removeMedicineRow(i)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                );
              })}
            </div>

            {!isCompleted && (
              <Button size="small" startIcon={<AddIcon />} onClick={addMedicineRow} className="mb-4">
                Add Medicine
              </Button>
            )}

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={2}
              className="mb-4"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isCompleted}
            />

            {!isCompleted && (
              <AddButton
                label={savingPrescription ? "Saving..." : "Save Prescription"}
                onClick={handleSavePrescription}
              />
            )}
          </Paper>
        </div>

        {/* Summary */}
        <div className="col-span-4">
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm sticky top-20">
            <Typography variant="h6" className="mb-4">Appointment Summary</Typography>
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="flex justify-between"><span>Patient</span><span>{appointment.patientName}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "-"}</span></div>
              <div className="flex justify-between"><span>Time</span><span>{appointment.time || "-"}</span></div>
              <div className="flex justify-between"><span>Reason</span><span>{appointment.reason || "-"}</span></div>
              <div className="flex justify-between"><span>Status</span><span>{appointment.status}</span></div>
            </div>
          </Paper>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
