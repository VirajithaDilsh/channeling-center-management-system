import React, { useCallback, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, TextField, Alert,
  Autocomplete, Chip, Typography, Tooltip,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import UndoIcon from "@mui/icons-material/Undo";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import { parsePrescriptionSpeech, estimateQty } from "../../utils/prescriptionSpeechParser";
import { matchMedicine } from "../../utils/medicineMatcher";

const STATUS_CHIP = {
  matched: { label: "Matched", color: "success" },
  ambiguous: { label: "Check medicine", color: "warning" },
  unmatched: { label: "Not recognised", color: "error" },
  chosen: { label: "Selected", color: "success" },
};

const optionLabel = (opt) => (opt?.name ? `${opt.name} (${opt.stockQuantity} in stock)` : "");

/**
 * Dictate (or type) a prescription, review the interpreted rows, then hand them
 * to the parent form. Nothing is saved here — the doctor still reviews and
 * presses "Save Prescription" on the consultation page.
 *
 * onConfirm(rows) receives rows shaped like the form's medicine rows, plus
 * `voiceIssue` ("UNMATCHED" | "AMBIGUOUS") and `spoken` for rows that still
 * need a medicine chosen.
 */
export default function VoicePrescriptionDialog({ open, onClose, medicineOptions, onConfirm }) {
  // transcript + interpreted rows (rows === null means "not interpreted yet"),
  // plus a history of earlier snapshots so the Undo icon can step back.
  const [st, setSt] = useState({ transcript: "", rows: null, history: [], lastKind: "" });
  const { transcript, rows, history } = st;

  // Applies a change and remembers the previous state. Consecutive typing is
  // grouped into one undo step.
  const commit = useCallback((kind, change) => {
    setSt((prev) => {
      const next = { ...prev, ...change(prev) };
      const grouped = kind === "typing" && prev.lastKind === "typing";
      return {
        ...next,
        history: grouped ? prev.history : [...prev.history, { transcript: prev.transcript, rows: prev.rows }].slice(-30),
        lastKind: kind,
      };
    });
  }, []);

  const undo = () => setSt((prev) => {
    if (prev.history.length === 0) return prev;
    const last = prev.history[prev.history.length - 1];
    return { transcript: last.transcript, rows: last.rows, history: prev.history.slice(0, -1), lastKind: "" };
  });

  const handleFinalText = useCallback((text) => {
    commit("speech", (p) => ({ transcript: p.transcript ? `${p.transcript} ${text}` : text, rows: null }));
  }, [commit]);

  // The parent mounts this dialog only while open, so state resets on close and
  // the hook's unmount cleanup releases the microphone.
  const { supported, listening, interim, error, start, stop } = useSpeechRecognition({ onFinalText: handleFinalText });

  const interpret = () => {
    if (listening) stop();
    commit("interpret", (p) => ({
      rows: parsePrescriptionSpeech(p.transcript).map((parsed, i) => {
        const match = matchMedicine(parsed.medicineText, parsed.strength, medicineOptions);
        return { id: i, parsed, match, medicine: match.medicine };
      }),
    }));
  };

  // Wipes the transcript and interpreted rows (can still be undone).
  const clearAll = () => {
    if (listening) stop();
    commit("clear", () => ({ transcript: "", rows: null }));
  };

  const setRowMedicine = (id, medicine) =>
    commit("pick", (p) => ({ rows: p.rows.map((r) => (r.id === id ? { ...r, medicine } : r)) }));
  const removeRow = (id) => commit("remove", (p) => ({ rows: p.rows.filter((r) => r.id !== id) }));

  const rowStatus = (r) => {
    if (r.medicine && r.medicine !== r.match.medicine) return "chosen";
    return r.match.status;
  };

  const confirm = () => {
    const out = rows
      .filter((r) => r.medicine || r.parsed.medicineText)
      .map((r) => {
        const { qty } = estimateQty(r.parsed, r.medicine);
        const issue = r.medicine ? null : r.match.status === "ambiguous" ? "AMBIGUOUS" : "UNMATCHED";
        return {
          medicineId: r.medicine?._id || "",
          name: r.medicine?.name || r.parsed.medicineText,
          dosage: r.parsed.dosage,
          frequency: r.parsed.frequency,
          duration: r.parsed.duration,
          instructions: r.parsed.instructions,
          qtyPrescribed: qty || 1,
          voiceIssue: issue,
          spoken: r.parsed.medicineText,
        };
      });
    onConfirm(out);
  };

  const canAdd = rows && rows.length > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Voice prescription</DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" className="!mb-3">
          Say each medicine as: <b>name, strength, frequency, duration, instructions</b> — for example
          “Paracetamol 500 milligrams twice daily for five days after meals. Next, amoxicillin 250 mg three times a day for seven days.”
          Say “next” between medicines. Avoid saying the patient’s name.
        </Alert>
        {!supported && (
          <Alert severity="error" className="!mb-3">
            This browser does not support speech recognition (Firefox, for example). Use Chrome or Edge to dictate,
            or type the prescription below and press “Interpret”.
          </Alert>
        )}
        {error && <Alert severity="error" className="!mb-3">{error}</Alert>}

        <div className="flex items-center gap-3 mb-2">
          <Button
            variant={listening ? "contained" : "outlined"}
            color={listening ? "error" : "primary"}
            startIcon={listening ? <StopIcon /> : <MicIcon />}
            disabled={!supported}
            onClick={listening ? stop : start}
          >
            {listening ? "Stop" : "Start dictating"}
          </Button>
          <Tooltip title={history.length === 0 ? "Nothing to undo" : "Undo last change"}>
            <span>
              <IconButton aria-label="Undo" disabled={history.length === 0} onClick={undo}>
                <UndoIcon />
              </IconButton>
            </span>
          </Tooltip>
          {listening && <Typography variant="body2" color="text.secondary">Listening… {interim}</Typography>}
        </div>

        <TextField
          label="Transcript (editable)"
          multiline
          minRows={3}
          fullWidth
          value={transcript}
          onChange={(e) => { const value = e.target.value; commit("typing", () => ({ transcript: value, rows: null })); }}
          helperText="Fix any misheard words here, then press Interpret."
        />

        <div className="mt-3 flex items-center gap-2">
          <Button variant="contained" disabled={!transcript.trim()} onClick={interpret}>Interpret</Button>
          <Button color="error" disabled={!transcript && !rows} onClick={clearAll}>Clear all</Button>
        </div>

        {rows && rows.length === 0 && (
          <Alert severity="warning" className="!mt-3">Nothing could be read from the transcript. Try again.</Alert>
        )}

        {canAdd && (
          <div className="mt-4 space-y-3">
            <Typography variant="subtitle2">Review before adding</Typography>
            {rows.map((r) => {
              const status = rowStatus(r);
              const chip = STATUS_CHIP[status];
              const qty = estimateQty(r.parsed, r.medicine);
              const lowStock = r.medicine && Number(r.medicine.stockQuantity) <= 0;
              const options = r.match.alternatives.length > 0
                ? [...r.match.alternatives, ...medicineOptions.filter((m) => !r.match.alternatives.includes(m))]
                : medicineOptions;
              return (
                <div key={r.id} className="rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Chip size="small" label={chip.label} color={chip.color} />
                    <Typography variant="caption" color="text.secondary" className="flex-1">
                      Heard: “{r.parsed.spoken}”
                    </Typography>
                    <Tooltip title="Remove">
                      <IconButton size="small" color="error" onClick={() => removeRow(r.id)}><DeleteIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </div>
                  <Autocomplete
                    size="small"
                    options={options}
                    getOptionLabel={optionLabel}
                    isOptionEqualToValue={(a, b) => a._id === b._id}
                    value={r.medicine}
                    onChange={(e, value) => setRowMedicine(r.id, value)}
                    renderInput={(params) => (
                      <TextField {...params} label="Medicine" error={!r.medicine}
                        helperText={!r.medicine ? "Choose the medicine, or remove this row" : lowStock ? "Out of stock" : ""} />
                    )}
                  />
                  <Typography variant="body2" className="!mt-2" color="text.secondary">
                    Dosage: {r.parsed.dosage || "—"} · Frequency: {r.parsed.frequency || "—"} · Duration: {r.parsed.duration || "—"}
                    {" · "}Instructions: {r.parsed.instructions || "—"} · Qty: {qty.qty ?? "1 (not stated)"}
                    {qty.basis === "assumed" && " (assumed 1 per dose — confirm)"}
                  </Typography>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!canAdd} onClick={confirm}>Add to prescription</Button>
      </DialogActions>
    </Dialog>
  );
}
