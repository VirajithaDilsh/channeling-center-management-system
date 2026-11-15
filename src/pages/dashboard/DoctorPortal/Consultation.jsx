import React, { useEffect, useState } from "react";
import {
  TextField, Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Snackbar, Alert, Button, IconButton, Autocomplete,
  Radio, RadioGroup, FormControlLabel, FormControl, Checkbox, Chip, Divider, Tooltip
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import HistoryIcon from "@mui/icons-material/History";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import MicIcon from "@mui/icons-material/Mic";import BackButton from "../../../components/BackButton";
import Icd10Select from "../../../components/Icd10Select";
import AddButton from "../../../components/AddButton";
import { getAppointmentById } from "../../../api/AppointmentApi";
import { getPatientById } from "../../../api/PatientApi";
import { getChannelingHistory } from "../../../api/ChannelingApi";
import { getPrescriptionsByPatient, createPrescription } from "../../../api/PrescriptionApi";
import { getMedicines } from "../../../api/MedicineApi";
import UseTemplateDialog from "../../../components/prescription/UseTemplateDialog";
import { ISSUE_LABELS } from "../../../components/prescription/templateIssues";
import SaveTemplateDialog from "../../../components/prescription/SaveTemplateDialog";
import VoicePrescriptionDialog from "../../../components/prescription/VoicePrescriptionDialog";
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
  diagnoses: [],
  notes: "",
};

// The pharmacy's prescription still carries a single diagnosis string, so
// combine the selected ICD-10 codes with any free-text notes.
const diagnosisSummary = ({ diagnoses = [], diagnosis = "" }) =>
  [...diagnoses.map((d) => `${d.code} – ${d.description}`), diagnosis.trim()]
    .filter(Boolean)
    .join("; ");

// Saved prescription items are held in the browser until the consultation is
// completed, and only then sent to the pharmacy. They're mirrored to
// localStorage so a refresh doesn't lose them (storage may be unavailable,
// so every access is guarded).
const pendingKey = (appointmentId) => `pendingPrescription:${appointmentId}`;
const loadPending = (appointmentId) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(pendingKey(appointmentId)) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};
const storePending = (appointmentId, items) => {
  try {
    if (items.length === 0) localStorage.removeItem(pendingKey(appointmentId));
    else localStorage.setItem(pendingKey(appointmentId), JSON.stringify(items));
  } catch {
    // storage unavailable — items still live in component state
  }
};

const toPrescriptionItem = (m) => ({
  medicineId: m.medicineId,
  name: m.name,
  dosage: m.dosage || "",
  frequency: m.frequency || "",
  duration: m.duration || "",
  instructions: m.instructions || "",
  qtyPrescribed: Number(m.qtyPrescribed),
});

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
  // The dropdown choice and the custom text are kept apart so switching
  // between "Other" and a predefined value never loses what was typed. The
  // saved diagnosis is always the actual text, never the word "Other".
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  // Prescription items the doctor has saved but that have NOT reached the
  // pharmacy yet — they're sent when the consultation is completed.
  const [pendingItems, setPendingItems] = useState(() => loadPending(appointmentId));

  const [savingDraft, setSavingDraft] = useState(false);
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [useTemplateOpen, setUseTemplateOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const updatePending = (items) => {
    setPendingItems(items);
    storePending(appointmentId, items);
  };

  // Moves a held item back into the form so it can be edited.
  const editPendingItem = (index) => {
    const item = pendingItems[index];
    const isBlank = (m) => !m.medicineId && !m.name && !m.dosage && !m.frequency && !m.duration && !m.instructions;
    setMedicines((prev) => [...prev.filter((m) => !isBlank(m)), { ...item }]);
    updatePending(pendingItems.filter((_, i) => i !== index));
  };

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
          diagnoses: existing.diagnoses || [],
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

  useEffect(() => {
    loadConsultation();
  }, [appointmentId]);

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
      ? { ...m, medicineId: selected?._id || "", name: selected?.name || "", templateIssue: null, voiceIssue: null }
      : m)));
  };

  // Adds rows produced by the voice dialog. Like applyTemplate, only local
  // state changes — the doctor reviews/edits and saves as usual. Rows whose
  // medicine wasn't recognised keep an empty medicineId and a voiceIssue flag,
  // which blocks saving until the doctor picks a medicine or removes the row.
  const applyVoiceRows = (rows) => {
    const isBlank = (m) => !m.medicineId && !m.name && !m.dosage && !m.frequency && !m.duration && !m.instructions;
    const existing = medicines.filter((m) => !isBlank(m));
    const present = new Set(existing.filter((m) => m.medicineId).map((m) => m.medicineId));
    const incoming = [];
    let skipped = 0;

    rows.forEach((row) => {
      if (row.medicineId && present.has(row.medicineId)) {
        skipped += 1;
        return;
      }
      if (row.medicineId) present.add(row.medicineId);
      incoming.push({ ...row, templateIssue: null });
    });

    const next = [...existing, ...incoming];
    setMedicines(next.length > 0 ? next : [{ ...emptyMedicine }]);
    setVoiceOpen(false);

    const flagged = incoming.filter((r) => r.voiceIssue).length;
    const parts = [`${incoming.length} medicine${incoming.length === 1 ? "" : "s"} added by voice — review before saving.`];
    if (skipped) parts.push(`${skipped} already in the prescription, skipped.`);
    if (flagged) parts.push(`${flagged} need a medicine chosen.`);
    showSnackbar(parts.join(" "), flagged ? "warning" : "success");
  };

  // Copies a template's items into the form. Only local state changes — the
  // doctor reviews/edits the rows and saves via "Save Prescription" as usual.
  // Items already in the form (same medicine) are skipped so applying twice
  // can't double up; rows are fresh copies, so edits never reach the template.
  const applyTemplate = (template) => {
    const isBlank = (m) => !m.medicineId && !m.name && !m.dosage && !m.frequency && !m.duration && !m.instructions;
    const keyOf = (m) => m.medicineId || `name:${(m.name || "").toLowerCase()}`;

    const existing = medicines.filter((m) => !isBlank(m));
    const present = new Set(existing.map(keyOf));
    const incoming = [];
    let skipped = 0;

    template.items.forEach((i) => {
      const deleted = i.issue === "DELETED";
      const row = {
        medicineId: deleted ? "" : i.medicineId,
        name: i.medicineName,
        dosage: i.dosage || "",
        frequency: i.frequency || "",
        duration: i.duration || "",
        instructions: i.instructions || "",
        qtyPrescribed: i.qtyPrescribed || 1,
        templateIssue: i.issue || null,
      };
      if (present.has(keyOf(row))) {
        skipped += 1;
        return;
      }
      present.add(keyOf(row));
      incoming.push(row);
    });

    const next = [...existing, ...incoming];
    setMedicines(next.length > 0 ? next : [{ ...emptyMedicine }]);
    setUseTemplateOpen(false);

    const flagged = incoming.filter((r) => r.templateIssue).length;
    const parts = [`Template "${template.name}" loaded — review before saving.`];
    if (skipped) parts.push(`${skipped} already in the prescription, skipped.`);
    if (flagged) parts.push(`${flagged} item${flagged === 1 ? "" : "s"} need attention.`);
    showSnackbar(parts.join(" "), flagged ? "warning" : "success");
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
    const unresolved = medicines.filter((m) => !m.medicineId && m.templateIssue === "DELETED");
    if (unresolved.length > 0) {
      showSnackbar(`Replace or remove: ${unresolved.map((m) => m.name).join(", ")} (no longer in inventory).`, "error");
      return;
    }

    const unrecognised = medicines.filter((m) => !m.medicineId && m.voiceIssue);
    if (unrecognised.length > 0) {
      showSnackbar(`Choose the medicine or remove the row for: ${unrecognised.map((m) => m.spoken || m.name).join(", ")}.`, "error");
      return;
    }

    const validMedicines = medicines.filter((m) => m.medicineId);
    if (validMedicines.length === 0) {
      showSnackbar("Add at least one medicine.", "error");
      return;
    }

    const badQty = validMedicines.find((m) => !Number.isInteger(Number(m.qtyPrescribed)) || Number(m.qtyPrescribed) < 1);
    if (badQty) {
      showSnackbar(`${badQty.name || "A medicine"} needs a whole-number quantity of at least 1.`, "error");
      return;
    }

    setSavingPrescription(true);
    try {
      // Save the clinical record so the diagnosis lives on the consultation.
      await saveConsultationDraft(appointmentId, draftPayload());

      // Nothing is sent to the pharmacy here. The items are held until the
      // consultation is completed. Saving the same medicine again replaces
      // the earlier held entry.
      const held = validMedicines.map(toPrescriptionItem);
      const heldIds = new Set(held.map((m) => m.medicineId));
      updatePending([...pendingItems.filter((p) => !heldIds.has(p.medicineId)), ...held]);

      showSnackbar("Prescription saved. It will be sent to the pharmacy when you complete the consultation.", "success");
      setMedicines([{ ...emptyMedicine }]);
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to save prescription. Please try again.", "error");
    } finally {
      setSavingPrescription(false);
    }
  };

  const handleCompleteConsultation = async () => {
    if (!clinical.chiefComplaint.trim()) {
      showSnackbar("Chief complaint is required before completing the consultation.", "error");
      return;
    }
    if (!clinical.diagnosis.trim() && clinical.diagnoses.length === 0) {
      showSnackbar("Add at least one diagnosis before completing the consultation.", "error");
      return;
    }
    if (prescriptionMode === PRESCRIPTION_MODES.HANDWRITTEN && !handwrittenConfirmed) {
      showSnackbar("Confirm that the handwritten prescription was given to the patient.", "error");
      return;
    }

    const typed = prescriptionMode === PRESCRIPTION_MODES.TYPED;
    if (typed) {
      // Rows still sitting in the form haven't been saved, so they would be
      // silently left out of the prescription.
      const unsaved = medicines.filter((m) => m.medicineId || m.templateIssue === "DELETED");
      if (unsaved.length > 0) {
        showSnackbar("Click Save Prescription (or remove the unsaved medicine rows) before completing.", "error");
        return;
      }
      const alreadySent = prescriptions.some((p) => String(p.appointmentId) === String(appointmentId));
      if (pendingItems.length === 0 && !alreadySent) {
        showSnackbar("Save the prescription before completing, or choose Handwritten Prescription / No Prescription.", "error");
        return;
      }
    }

    setCompleting(true);
    let sentToPharmacy = false;
    try {
      // The prescription only reaches the pharmacy now, as part of completing.
      if (typed && pendingItems.length > 0) {
        // No doctorId/doctorName is sent — the backend attributes the
        // prescription to the authenticated doctor's own profile.
        await createPrescription({
          appointmentId,
          patientId: appointment.patientId,
          patientName: appointment.patientName,
          diagnosis: diagnosisSummary(clinical),
          notes: clinical.notes,
          items: pendingItems.map((m) => ({
            medicineId: m.medicineId,
            dosage: m.dosage,
            frequency: m.frequency,
            duration: m.duration,
            instructions: m.instructions,
            qtyPrescribed: Number(m.qtyPrescribed),
          })),
        });
        sentToPharmacy = true;
        updatePending([]);
      }

      // One call: the backend records the clinical notes, closes the
      // appointment, and works out the billing transition from the method.
      await completeConsultation(appointmentId, draftPayload());
      // Drop any leftover held items (e.g. the doctor switched to handwritten).
      updatePending([]);
      showSnackbar(
        typed ? "Consultation completed. Prescription sent to the pharmacy." : "Consultation completed.",
        "success",
      );
      setTimeout(() => navigate("/dashboard/doctor-home"), 900);
    } catch (err) {
      console.error(err);
      const reason = err.response?.data?.message || "Failed to complete the consultation.";
      if (sentToPharmacy) {
        // The prescription is already queued, so a retry of Complete will
        // go straight through without sending it twice.
        setPrescriptions((await getPrescriptionsByPatient(appointment.patientId).catch(() => [])) || []);
        showSnackbar(`The prescription was sent to the pharmacy, but the consultation was not completed: ${reason} Fix the issue and click Complete again.`, "error");
      } else {
        showSnackbar(reason, "error");
      }
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

  // Rows that can go into a template: a real medicine is selected.
  const templateSourceRows = medicines.filter((m) => m.medicineId);

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
              <Icd10Select
                value={clinical.diagnoses}
                onChange={(diagnoses) => setClinical((prev) => ({ ...prev, diagnoses }))}
                disabled={readOnly}
              />
              <TextField
                label="Additional Diagnosis Notes"
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
                      <div key={i}>
                      {m.templateIssue && (
                        <p className="text-xs text-amber-700 mb-1">
                          <WarningAmberIcon sx={{ fontSize: 14 }} className="mr-1" />
                          {m.name}: {ISSUE_LABELS[m.templateIssue]}
                          {m.templateIssue === "DELETED" ? " — choose a replacement or remove this row" : " — check before prescribing"}
                        </p>
                      )}
                      {m.voiceIssue && !m.medicineId && (
                        <p className="text-xs text-amber-700 mb-1">
                          <WarningAmberIcon sx={{ fontSize: 14 }} className="mr-1" />
                          Heard “{m.spoken}” —{" "}
                          {m.voiceIssue === "AMBIGUOUS" ? "several medicines are similar" : "not found in inventory"}
                          {" "}— choose the medicine or remove this row
                        </p>
                      )}
                      <div className={`grid grid-cols-12 gap-2 items-center ${m.templateIssue || (m.voiceIssue && !m.medicineId) ? "rounded-lg bg-amber-50 p-1" : ""}`}>
                        <Autocomplete
                          className="col-span-3"
                          size="small"
                          options={medicineOptions}
                          getOptionLabel={(opt) => opt.name ? `${opt.name} (${opt.stockQuantity} in stock)` : ""}
                          value={selectedMedicine}
                          disabled={readOnly}
                          onChange={(event, value) => handleMedicineSelect(i, value)}
                          renderInput={(params) => <TextField {...params} label="Medicine" error={(m.templateIssue === "DELETED" || !!m.voiceIssue) && !m.medicineId} />}
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
                      </div>
                    );
                  })}
                </div>

                {!readOnly && (
                  <div className="flex items-center gap-3">
                    <Button size="small" startIcon={<AddIcon />} onClick={addMedicineRow}>
                      Add Medicine
                    </Button>

                    <Button size="small" startIcon={<LibraryAddIcon />} onClick={() => setUseTemplateOpen(true)}>
                      Use Template
                    </Button>

                    <Button size="small" startIcon={<MicIcon />} onClick={() => setVoiceOpen(true)}>
                      Voice
                    </Button>

                    <Tooltip title={templateSourceRows.length === 0 ? "Add at least one medicine to save a template" : ""}>
                      <span>
                        <Button size="small" startIcon={<BookmarkAddIcon />} disabled={templateSourceRows.length === 0}
                          onClick={() => setSaveTemplateOpen(true)}>
                          Save as Template
                        </Button>
                      </span>
                    </Tooltip>

                    <AddButton
                      label={savingPrescription ? "Saving..." : "Save Prescription"}
                      onClick={handleSavePrescription}
                    />
                  </div>
                )}

                {!readOnly && pendingItems.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="text-sm font-medium text-amber-800 mb-2">
                      Saved — will be sent to the pharmacy when you complete the consultation
                    </p>
                    <ul className="space-y-1">
                      {pendingItems.map((item, i) => (
                        <li key={item.medicineId} className="flex items-center justify-between gap-2 text-sm text-gray-800">
                          <span>
                            <b>{item.name}</b>
                            {[item.dosage, item.frequency, item.duration].filter(Boolean).length > 0
                              && ` — ${[item.dosage, item.frequency, item.duration].filter(Boolean).join(", ")}`}
                            {` · Qty ${item.qtyPrescribed}`}
                          </span>
                          <span className="shrink-0">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => editPendingItem(i)}><EditIcon fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="Remove">
                              <IconButton size="small" color="error"
                                onClick={() => updatePending(pendingItems.filter((_, idx) => idx !== i))}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </span>
                        </li>
                      ))}
                    </ul>
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
                  {c.doctorName ? ` • Dr. ${c.doctorName.replace(/^dr\.?\s+/i, "")}` : ""}
                </p>

                {c.diagnoses?.length > 0 && (
                  <div className="flex flex-wrap gap-1 my-1">
                    {c.diagnoses.map((d) => (
                      <Chip key={d.code} size="small" label={`${d.code} – ${d.description}`} />
                    ))}
                  </div>
                )}

                {(c.diagnosis || !c.diagnoses?.length) && (
                  <p className="text-sm font-medium">{c.diagnosis || "No diagnosis recorded"}</p>
                )}

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
                  {p.doctorName ? ` • Dr. ${p.doctorName.replace(/^dr\.?\s+/i, "")}` : ""}
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

      <UseTemplateDialog open={useTemplateOpen} onClose={() => setUseTemplateOpen(false)} onSelect={applyTemplate} />
      {voiceOpen && (
        <VoicePrescriptionDialog
          open
          onClose={() => setVoiceOpen(false)}
          medicineOptions={medicineOptions}
          onConfirm={applyVoiceRows}
        />
      )}
      <SaveTemplateDialog
        open={saveTemplateOpen}
        items={templateSourceRows}
        onClose={() => setSaveTemplateOpen(false)}
        onSaved={(t) => {
          setSaveTemplateOpen(false);
          showSnackbar(`Template "${t.name}" saved.`);
        }}
      />

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
