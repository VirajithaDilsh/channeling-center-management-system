import React, { useEffect, useState } from "react";
import {
  TextField, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Snackbar, Alert, Button, IconButton, Autocomplete,
  Radio, RadioGroup, FormControlLabel, FormControl, Checkbox, Chip, Divider
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import BackButton from "../../../components/BackButton";
import AddButton from "../../../components/AddButton";
import { getAppointmentById } from "../../../api/AppointmentApi";
import { getPatientById } from "../../../api/PatientApi";
import { getChannelingHistory } from "../../../api/ChannelingApi";
import { getPrescriptionsByPatient, createPrescription } from "../../../api/PrescriptionApi";
import { getMedicines } from "../../../api/MedicineApi";
import {
  getConsultationByAppointment,
  getConsultationsByPatient,
  saveConsultationDraft,
  completeConsultation,
} from "../../../api/ConsultationApi";

const emptyMedicine = { medicineId: "", name: "", dosage: "", frequency: "", duration: "", instructions: "", qtyPrescribed: 1 };

const PRESCRIPTION_MODES = {
  TYPED: "TYPED",
  HANDWRITTEN: "HANDWRITTEN",
  NONE: "NONE",
};

const emptyClinical = {
  chiefComplaint: "",
  symptoms: "",
  examination: "",
  diagnosis: "",
  notes: "",
};

const HeaderField = ({ label, value }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
    <p className="text-sm font-medium text-gray-800">{value || "-"}</p>
  </div>
);

export default function Consultation() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [registrationHistory, setRegistrationHistory] = useState([]);
  const [pastConsultations, setPastConsultations] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);

  const [clinical, setClinical] = useState(emptyClinical);
  const [prescriptionMode, setPrescriptionMode] = useState(PRESCRIPTION_MODES.TYPED);
  const [handwrittenConfirmed, setHandwrittenConfirmed] = useState(false);
  const [consultationStatus, setConsultationStatus] = useState("IN_PROGRESS");
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);

  const [savingDraft, setSavingDraft] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadConsultation();
  }, [appointmentId]);

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const loadConsultation = async () => {
    try {
      // Loads just this appointment via GET /api/appointments/:id rather than
      // fetching every appointment and filtering client-side.
      const found = await getAppointmentById(appointmentId);
      setAppointment(found);

      const [patientData, history] = await Promise.all([
        getPatientById(found.patientId),
        getChannelingHistory(found.patientId).catch(() => []),
      ]);
      setPatient(patientData);
      setRegistrationHistory(history || []);

      // Each of these enriches a panel; a failure in one shouldn't block the
      // consultation itself.
      try {
        const existing = await getConsultationByAppointment(appointmentId);
        setClinical({
          chiefComplaint: existing.chiefComplaint || "",
          symptoms: existing.symptoms || "",
          examination: existing.examination || "",
          diagnosis: existing.diagnosis || "",
          notes: existing.notes || "",
        });
        if (existing.prescriptionMode) setPrescriptionMode(existing.prescriptionMode);
        setHandwrittenConfirmed(!!existing.handwrittenConfirmedAt);
        setConsultationStatus(existing.status || "IN_PROGRESS");
      } catch {
        // 404 simply means this is the first time the doctor has opened it.
      }

      try {
        setPastConsultations(await getConsultationsByPatient(found.patientId));
      } catch (err) {
        console.error("Could not load consultation history:", err);
      }

      try {
        setPrescriptions((await getPrescriptionsByPatient(found.patientId)) || []);
      } catch (err) {
        console.error("Could not load prescriptions:", err);
      }

      try {
        setMedicineOptions((await getMedicines()) || []);
      } catch (err) {
        console.error("Could not load medicine list:", err);
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load consultation details", "error");
    }
  };

  const handleClinicalChange = (field) => (e) =>
    setClinical((prev) => ({ ...prev, [field]: e.target.value }));

  const handleModeChange = (e) => {
    setPrescriptionMode(e.target.value);
    if (e.target.value !== PRESCRIPTION_MODES.HANDWRITTEN) setHandwrittenConfirmed(false);
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

  const draftPayload = () => ({
    ...clinical,
    prescriptionMode,
    handwrittenConfirmed,
  });

  const handleSaveConsultation = async () => {
    setSavingDraft(true);
    try {
      await saveConsultationDraft(appointmentId, draftPayload());
      showSnackbar("Consultation saved.", "success");
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save consultation.", "error");
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSavePrescription = async () => {
    const validMedicines = medicines.filter((m) => m.medicineId);
    if (validMedicines.length === 0) {
      showSnackbar("Add at least one medicine.", "error");
      return;
    }

    setSavingPrescription(true);
    try {
      // Save the clinical record first so the diagnosis lives on the
      // consultation, not on the pharmacy's work order.
      await saveConsultationDraft(appointmentId, draftPayload());

      // No doctorId/doctorName is sent — the backend attributes the
      // prescription to the authenticated doctor's own profile.
      await createPrescription({
        appointmentId,
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        diagnosis: clinical.diagnosis,
        notes: clinical.notes,
        items: validMedicines.map((m) => ({
          medicineId: m.medicineId,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
          qtyPrescribed: Number(m.qtyPrescribed) || 1,
        })),
      });

      showSnackbar("Prescription saved and sent to the pharmacy.", "success");
      setMedicines([{ ...emptyMedicine }]);
      setPrescriptions((await getPrescriptionsByPatient(appointment.patientId).catch(() => [])) || []);
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save prescription. Please try again.", "error");
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (prescriptionMode === PRESCRIPTION_MODES.HANDWRITTEN && !handwrittenConfirmed) {
      showSnackbar("Confirm that the handwritten prescription was given to the patient.", "error");
      return;
    }

    setCompleting(true);
    try {
      // One call: the backend records the clinical notes, closes the
      // appointment, and works out the billing transition from the method.
      await completeConsultation(appointmentId, draftPayload());
      showSnackbar("Consultation completed.", "success");
      setTimeout(() => navigate("/dashboard/doctor-home"), 900);
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to complete the consultation.", "error");
    } finally {
      setCompleting(false);
    }
  };

  if (!appointment || !patient) {
    return <p className="p-6">Loading consultation...</p>;
  }

  const isCompleted = consultationStatus === "COMPLETED" || appointment.status === "Completed";
  const readOnly = isCompleted;

  // Patient has no allergies field of its own — it's captured at the patient
  // desk on the registration record, so use the most recent one that has it.
  const allergies = registrationHistory.find((r) => r.allergies)?.allergies;

  const typedPrescriptionsForVisit = prescriptions.filter(
    (p) => String(p.appointmentId) === String(appointmentId)
  );

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

        {!readOnly && (
          <div className="flex gap-3">
            <Button
              variant="outlined"
              onClick={handleSaveConsultation}
              disabled={savingDraft}
            >
              {savingDraft ? "Saving..." : "Save Consultation"}
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleCompleteConsultation}
              disabled={completing}
            >
              {completing ? "Completing..." : "Complete Consultation"}
            </Button>
          </div>
        )}

        {readOnly && <Chip label="Consultation completed" color="success" />}
      </div>

      {/* PATIENT HEADER */}
      <Paper elevation={0} className="p-6 rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-4">
          <PersonIcon className="text-blue-500" />
          <Typography variant="h6">{patient.name}</Typography>
          <Chip size="small" label={patient.patientId} variant="outlined" />
          <Chip
            size="small"
            label={appointment.status || "-"}
            color={appointment.status === "Completed" ? "success" : "info"}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <HeaderField label="Age" value={patient.age} />
          <HeaderField label="Gender" value={patient.gender} />
          <HeaderField label="Contact" value={patient.phone} />
          <HeaderField label="Blood Group" value={patient.blood} />
          <HeaderField
            label="Appointment"
            value={`${appointment.date ? new Date(appointment.date).toLocaleDateString() : "-"}${appointment.time ? ` • ${appointment.time}` : ""}`}
          />
          <HeaderField label="Service" value={appointment.reason} />
          <HeaderField label="Doctor" value={appointment.doctorName} />
          <HeaderField label="Patient ID" value={patient.patientId} />
        </div>

        {allergies && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3">
            <WarningAmberIcon className="text-amber-600" fontSize="small" />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Allergies:</span> {allergies}
            </p>
          </div>
        )}
      </Paper>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* CONSULTATION */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <MedicalInformationIcon className="text-blue-500" />
              <Typography variant="h6">Consultation</Typography>
            </div>

            <div className="space-y-4">
              <TextField
                label="Chief Complaint"
                fullWidth
                value={clinical.chiefComplaint}
                onChange={handleClinicalChange("chiefComplaint")}
                disabled={readOnly}
              />
              <TextField
                label="Symptoms / History"
                fullWidth
                multiline
                rows={3}
                value={clinical.symptoms}
                onChange={handleClinicalChange("symptoms")}
                disabled={readOnly}
              />
              <TextField
                label="Examination / Findings"
                fullWidth
                multiline
                rows={3}
                value={clinical.examination}
                onChange={handleClinicalChange("examination")}
                disabled={readOnly}
              />
              <TextField
                label="Diagnosis"
                fullWidth
                value={clinical.diagnosis}
                onChange={handleClinicalChange("diagnosis")}
                disabled={readOnly}
              />
              <TextField
                label="Doctor Notes"
                fullWidth
                multiline
                rows={3}
                value={clinical.notes}
                onChange={handleClinicalChange("notes")}
                disabled={readOnly}
              />
            </div>
          </Paper>

          {/* PRESCRIPTION */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ReceiptLongIcon className="text-blue-500" />
              <Typography variant="h6">Prescription</Typography>
            </div>

            <FormControl disabled={readOnly}>
              <RadioGroup value={prescriptionMode} onChange={handleModeChange}>
                <FormControlLabel
                  value={PRESCRIPTION_MODES.TYPED}
                  control={<Radio />}
                  label="Type Prescription"
                />
                <FormControlLabel
                  value={PRESCRIPTION_MODES.HANDWRITTEN}
                  control={<Radio />}
                  label="Handwritten Prescription"
                />
                <FormControlLabel
                  value={PRESCRIPTION_MODES.NONE}
                  control={<Radio />}
                  label="No Prescription"
                />
              </RadioGroup>
            </FormControl>

            <Divider className="!my-5" />

            {prescriptionMode === PRESCRIPTION_MODES.TYPED && (
              <div>
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
                          disabled={readOnly}
                          onChange={(event, value) => handleMedicineSelect(i, value)}
                          renderInput={(params) => <TextField {...params} label="Medicine" />}
                        />
                        <TextField className="col-span-1" label="Qty" type="number" size="small" value={m.qtyPrescribed} disabled={readOnly}
                          inputProps={{ min: 1 }}
                          onChange={(e) => handleMedicineChange(i, "qtyPrescribed", e.target.value)} />
                        <TextField className="col-span-2" label="Dosage" size="small" value={m.dosage} disabled={readOnly}
                          onChange={(e) => handleMedicineChange(i, "dosage", e.target.value)} />
                        <TextField className="col-span-2" label="Frequency" size="small" value={m.frequency} disabled={readOnly}
                          onChange={(e) => handleMedicineChange(i, "frequency", e.target.value)} />
                        <TextField className="col-span-2" label="Duration" size="small" value={m.duration} disabled={readOnly}
                          onChange={(e) => handleMedicineChange(i, "duration", e.target.value)} />
                        <TextField className="col-span-1" label="Instructions" size="small" value={m.instructions} disabled={readOnly}
                          onChange={(e) => handleMedicineChange(i, "instructions", e.target.value)} />
                        <IconButton className="col-span-1" size="small" color="error" disabled={readOnly || medicines.length === 1}
                          onClick={() => removeMedicineRow(i)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    );
                  })}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-3">
                    <Button size="small" startIcon={<AddIcon />} onClick={addMedicineRow}>
                      Add Medicine
                    </Button>

                    <AddButton
                      label={savingPrescription ? "Saving..." : "Save Prescription"}
                      onClick={handleSavePrescription}
                    />
                  </div>
                )}

                {typedPrescriptionsForVisit.length > 0 && (
                  <p className="text-sm text-green-700 mt-4">
                    {typedPrescriptionsForVisit.length} prescription
                    {typedPrescriptionsForVisit.length > 1 ? "s" : ""} sent to the pharmacy for this visit.
                  </p>
                )}
              </div>
            )}

            {prescriptionMode === PRESCRIPTION_MODES.HANDWRITTEN && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <Typography variant="subtitle1" className="font-medium">
                  Handwritten Prescription
                </Typography>
                <p className="text-sm text-gray-600 mt-1">
                  The doctor will provide the prescription directly to the patient.
                  Nothing is sent to the pharmacy, because the medicine details are
                  not recorded in the system.
                </p>

                <FormControlLabel
                  className="!mt-3"
                  control={
                    <Checkbox
                      checked={handwrittenConfirmed}
                      disabled={readOnly}
                      onChange={(e) => setHandwrittenConfirmed(e.target.checked)}
                    />
                  }
                  label="I confirm that the handwritten prescription has been provided to the patient."
                />
              </div>
            )}

            {prescriptionMode === PRESCRIPTION_MODES.NONE && (
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                <Typography variant="subtitle1" className="font-medium">
                  No Prescription
                </Typography>
                <p className="text-sm text-gray-600 mt-1">
                  No medicines will be prescribed for this visit and nothing will be
                  sent to the pharmacy.
                </p>
              </div>
            )}
          </Paper>

          {/* PREVIOUS CONSULTATIONS */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <HistoryIcon className="text-purple-500" />
              <Typography variant="h6">Previous Consultations</Typography>
            </div>

            {pastConsultations.length === 0 && (
              <p className="text-gray-500 text-sm">No previous consultations recorded for this patient.</p>
            )}

            {pastConsultations.map((c) => (
              <div key={c._id} className="border-b last:border-0 py-3">
                <p className="text-sm text-gray-500">
                  {c.completedAt ? new Date(c.completedAt).toLocaleDateString() : ""}
                  {c.doctorName ? ` • Dr. ${c.doctorName}` : ""}
                </p>

                <p className="text-sm font-medium">{c.diagnosis || "No diagnosis recorded"}</p>

                {c.notes && <p className="text-sm text-gray-600">{c.notes}</p>}

                <p className="text-xs text-gray-500 mt-1">
                  {c.prescriptionMode === "TYPED" &&
                    (c.prescriptions?.flatMap((p) => p.items || []).map((i) => i.name).join(", ")
                      || "Typed prescription")}
                  {c.prescriptionMode === "HANDWRITTEN" && "Handwritten prescription given to patient"}
                  {c.prescriptionMode === "NONE" && "No prescription"}
                </p>
              </div>
            ))}
          </Paper>

          {/* PATIENT REGISTRATION RECORDS — patient-desk data, kept separate */}
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <MedicalInformationIcon className="text-red-500" />
              <Typography variant="h6">Patient Registration Records</Typography>
            </div>
            <p className="text-gray-500 text-xs mb-4">
              Vitals and history recorded at the patient desk
            </p>

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
                  {registrationHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-gray-500">No records yet.</TableCell>
                    </TableRow>
                  )}
                  {registrationHistory.map((v) => (
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
        </div>

        {/* SIDEBAR */}
        <div className="col-span-12 lg:col-span-4">
          <Paper elevation={0} className="p-6 rounded-3xl shadow-sm sticky top-20">
            <Typography variant="h6" className="mb-4">Appointment Summary</Typography>
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="flex justify-between"><span>Patient</span><span>{appointment.patientName}</span></div>
              <div className="flex justify-between"><span>Date</span><span>{appointment.date ? new Date(appointment.date).toLocaleDateString() : "-"}</span></div>
              <div className="flex justify-between"><span>Time</span><span>{appointment.time || "-"}</span></div>
              <div className="flex justify-between"><span>Service</span><span>{appointment.reason || "-"}</span></div>
              <div className="flex justify-between"><span>Doctor</span><span>{appointment.doctorName || "-"}</span></div>
              <div className="flex justify-between"><span>Status</span><span>{appointment.status}</span></div>
            </div>

            <Divider className="!my-4" />

            <Typography variant="subtitle2" className="mb-2">Past Prescriptions</Typography>
            {prescriptions.length === 0 && (
              <p className="text-gray-500 text-sm">None on file.</p>
            )}
            {prescriptions.slice(0, 5).map((p) => (
              <div key={p._id} className="py-2 border-b last:border-0">
                <p className="text-xs text-gray-500">
                  {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                  {p.doctorName ? ` • Dr. ${p.doctorName}` : ""}
                </p>
                <p className="text-sm">{(p.items || []).map((m) => m.name).join(", ")}</p>
                <span className={p.status === "RESOLVED" ? "text-xs text-green-600" : "text-xs text-amber-600"}>
                  {p.status === "RESOLVED" ? "Completed by pharmacy" : "Waiting at pharmacy"}
                </span>
              </div>
            ))}
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
