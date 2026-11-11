import React, { useEffect, useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Autocomplete, TextField, Button, IconButton, Snackbar, Alert, MenuItem, Chip, Divider,
  ToggleButton, ToggleButtonGroup
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import { getPatients } from "../../../api/PatientApi";
import { getMedicines } from "../../../api/MedicineApi";
import { listVisitSessions } from "../../../api/VisitSessionApi";
import { dispenseExternalPrescription } from "../../../api/ExternalPrescriptionApi";
import { getPublicSettings } from "../../../api/SettingsApi";

const emptyLine = { medicineId: "", qty: 1 };

const WALK_IN = "__WALK_IN__";

export default function ExternalPrescription() {
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [currencySymbol, setCurrencySymbol] = useState("Rs.");

  // Not every walk-in is on our books — someone can come in off the street
  // with a paper prescription. A guest is billed by name and gets no Patient
  // record; see the backend model comment for why.
  const [patientType, setPatientType] = useState("REGISTERED");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [prescribedBy, setPrescribedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState([{ ...emptyLine }]);

  const [openSessions, setOpenSessions] = useState([]);
  const [billTarget, setBillTarget] = useState(WALK_IN);

  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const isGuest = patientType === "GUEST";

  useEffect(() => {
    // Both pickers read from modules the pharmacy doesn't own, so a role with
    // pharmacy permissions but no patients_read / inventory_read will fail
    // here — say so rather than showing an empty dropdown.
    getPatients()
      .then(setPatients)
      .catch((err) => {
        console.error("Could not load patients:", err);
        showSnackbar("Could not load the patient list — you may not have patient read access.", "error");
      });

    getMedicines()
      .then(setMedicines)
      .catch((err) => {
        console.error("Could not load medicines:", err);
        showSnackbar("Could not load the medicine list — you may not have inventory read access.", "error");
      });

    getPublicSettings()
      .then((data) => data.currencySymbol && setCurrencySymbol(data.currencySymbol))
      .catch((err) => console.error("Could not load currency settings:", err));
  }, []);

  // Offer to add the charges to a visit the patient already has open, so a
  // patient mid-visit doesn't end up with two separate bills.
  useEffect(() => {
    setBillTarget(WALK_IN);
    setOpenSessions([]);
    if (isGuest || !selectedPatient) return;

    listVisitSessions({ patientId: selectedPatient.patientId })
      .then((sessions) =>
        setOpenSessions(sessions.filter((s) => !["CLOSED", "CANCELED"].includes(s.status)))
      )
      .catch((err) => console.error("Could not load visits for this patient:", err));
  }, [selectedPatient, isGuest]);

  const medicineById = new Map(medicines.map((m) => [m._id, m]));

  const updateLine = (index, patch) =>
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));

  const addLine = () => setLines((prev) => [...prev, { ...emptyLine }]);
  const removeLine = (index) => setLines((prev) => prev.filter((_, i) => i !== index));

  const lineAmount = (line) => {
    const medicine = medicineById.get(line.medicineId);
    if (!medicine) return 0;
    return (Number(line.qty) || 0) * (medicine.unitPrice || 0);
  };

  const total = lines.reduce((sum, l) => sum + lineAmount(l), 0);

  const money = (value) => `${currencySymbol} ${Number(value || 0).toFixed(2)}`;

  const resetForm = () => {
    setSelectedPatient(null);
    setGuestName("");
    setGuestPhone("");
    setPrescribedBy("");
    setNotes("");
    setLines([{ ...emptyLine }]);
    setBillTarget(WALK_IN);
  };

  // Client-side checks are for fast feedback only — the backend re-validates
  // stock inside the transaction, which is what actually prevents overselling.
  const validate = () => {
    if (isGuest) {
      if (!guestName.trim()) return "Enter the guest's name.";
    } else if (!selectedPatient) {
      return "Select a patient.";
    }

    const filled = lines.filter((l) => l.medicineId);
    if (filled.length === 0) return "Add at least one medicine.";

    const ids = filled.map((l) => l.medicineId);
    if (new Set(ids).size !== ids.length) {
      return "The same medicine is listed twice — combine it into one line.";
    }

    for (const line of filled) {
      const qty = Number(line.qty);
      const medicine = medicineById.get(line.medicineId);
      if (!Number.isInteger(qty) || qty < 1) {
        return `Enter a whole quantity of at least 1 for ${medicine?.name || "each medicine"}.`;
      }
      if (medicine && qty > medicine.stockQuantity) {
        return `Only ${medicine.stockQuantity} of ${medicine.name} in stock.`;
      }
    }

    return null;
  };

  const handleDispense = async () => {
    const problem = validate();
    if (problem) {
      showSnackbar(problem, "error");
      return;
    }

    setSaving(true);
    try {
      await dispenseExternalPrescription({
        patientId: isGuest ? undefined : selectedPatient.patientId,
        guestName: isGuest ? guestName.trim() : undefined,
        guestPhone: isGuest ? guestPhone.trim() || undefined : undefined,
        prescribedBy: prescribedBy.trim() || undefined,
        notes: notes.trim() || undefined,
        visitSessionId: isGuest || billTarget === WALK_IN ? undefined : billTarget,
        items: lines
          .filter((l) => l.medicineId)
          .map((l) => ({ medicineId: l.medicineId, qty: Number(l.qty) })),
      });

      showSnackbar("Dispensed. The medication charges have been sent to Billing.", "success");
      resetForm();
      // Stock changed, so the pickers need the new numbers.
      getMedicines().then(setMedicines).catch(() => {});
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to dispense the prescription.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Paper elevation={0} className="p-6 rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-2 mb-1">
          <DescriptionIcon className="text-emerald-600" />
          <Typography variant="h6">External Prescription</Typography>
        </div>
        <p className="text-gray-500 text-sm mb-5">
          For a paper prescription the patient brought from an outside doctor or clinic.
          Our own doctors' typed prescriptions arrive in the Dispensing Queue instead.
        </p>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={patientType}
          onChange={(e, value) => value && setPatientType(value)}
          className="mb-5"
        >
          <ToggleButton value="REGISTERED">Registered Patient</ToggleButton>
          <ToggleButton value="GUEST">Guest (not registered)</ToggleButton>
        </ToggleButtonGroup>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isGuest ? (
            <>
              <TextField
                label="Guest Name"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
              />

              <TextField
                label="Guest Phone (optional)"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
              />
            </>
          ) : (
            <>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => (p.name ? `${p.name} (${p.patientId})` : "")}
                value={selectedPatient}
                onChange={(event, value) => setSelectedPatient(value)}
                renderInput={(params) => <TextField {...params} label="Patient" />}
              />

              <TextField
                select
                label="Bill to"
                value={billTarget}
                onChange={(e) => setBillTarget(e.target.value)}
                disabled={!selectedPatient}
                helperText={
                  openSessions.length > 0
                    ? "This patient has an open visit — you can add the medicines to that bill."
                    : "A separate pharmacy bill will be created."
                }
              >
                <MenuItem value={WALK_IN}>New pharmacy bill</MenuItem>
                {openSessions.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {`Visit ${s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}`}
                    {s.doctorName ? ` — ${s.doctorName}` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </>
          )}

          <TextField
            label="Prescribed By (optional)"
            placeholder="Outside doctor or clinic"
            value={prescribedBy}
            onChange={(e) => setPrescribedBy(e.target.value)}
          />

          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {isGuest && (
          <p className="text-gray-500 text-xs mt-4">
            No patient record will be created. The sale is billed by name on its own
            pharmacy bill and appears in Billing marked as a guest.
          </p>
        )}
      </Paper>

      <Paper elevation={0} className="p-6 rounded-3xl shadow-sm">
        <Typography variant="subtitle1" className="font-medium mb-3">Medicines</Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Medicine</TableCell>
                <TableCell align="right">In Stock</TableCell>
                <TableCell align="right">Quantity</TableCell>
                <TableCell align="right">Unit Price</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line, i) => {
                const medicine = medicineById.get(line.medicineId) || null;
                const short = medicine && Number(line.qty) > medicine.stockQuantity;

                return (
                  <TableRow key={i}>
                    <TableCell width="40%">
                      <Autocomplete
                        size="small"
                        options={medicines}
                        getOptionLabel={(m) => m.name || ""}
                        value={medicine}
                        onChange={(event, value) => updateLine(i, { medicineId: value?._id || "" })}
                        renderInput={(params) => <TextField {...params} label="Select from inventory" />}
                      />
                    </TableCell>

                    <TableCell align="right">
                      {medicine ? (
                        <Chip
                          size="small"
                          label={medicine.stockQuantity}
                          color={short ? "error" : "default"}
                        />
                      ) : "-"}
                    </TableCell>

                    <TableCell align="right" width="14%">
                      <TextField
                        size="small"
                        type="number"
                        value={line.qty}
                        error={!!short}
                        inputProps={{ min: 1 }}
                        onChange={(e) => updateLine(i, { qty: e.target.value })}
                      />
                    </TableCell>

                    <TableCell align="right">{medicine ? money(medicine.unitPrice) : "-"}</TableCell>
                    <TableCell align="right">{medicine ? money(lineAmount(line)) : "-"}</TableCell>

                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={lines.length === 1}
                        onClick={() => removeLine(i)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Button size="small" startIcon={<AddIcon />} onClick={addLine} className="!mt-3">
          Add Medicine
        </Button>

        <Divider className="!my-4" />

        <div className="flex items-center justify-between">
          <Typography variant="subtitle1">
            Total Medication Amount: <span className="font-semibold">{money(total)}</span>
          </Typography>

          <Button
            variant="contained"
            color="success"
            onClick={handleDispense}
            disabled={saving}
          >
            {saving ? "Dispensing..." : "Dispense"}
          </Button>
        </div>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
