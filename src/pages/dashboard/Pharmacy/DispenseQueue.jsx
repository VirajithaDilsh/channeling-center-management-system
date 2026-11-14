import React, { useEffect, useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from "@mui/material";
import PillIcon from "@mui/icons-material/Medication";
import { getPharmacyQueue, dispenseItem, rejectItem, handoffToBilling } from "../../../api/PrescriptionApi";
import { DISPENSE_STATUS_LABELS, labelFor } from "../../../utils/statusLabels";

const statusColors = {
  QUEUED: "warning",
  DISPENSED: "success",
  PARTIAL: "info",
  REJECTED: "error",
  CANCELED: "default",
};

export default function DispenseQueue({ embedded = false }) {
  const [prescriptions, setPrescriptions] = useState([]);
  // True while a dispense/reject/handoff request is in flight — disables every
  // action button so a double click can't send the same action twice.
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dispenseTarget, setDispenseTarget] = useState(null); // { prescription, item }
  const [dispenseQty, setDispenseQty] = useState("");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await getPharmacyQueue();
      setPrescriptions(data || []);
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to load pharmacy queue.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openDispenseDialog = (prescription, item) => {
    setDispenseTarget({ prescription, item });
    setDispenseQty(String(item.qtyPrescribed - item.qtyDispensed));
  };

  const handleDispense = async () => {
    if (busy) return;
    const { prescription, item } = dispenseTarget;
    setBusy(true);
    try {
      await dispenseItem(prescription._id, item._id, Number(dispenseQty) || undefined);
      showSnackbar(`Dispensed ${item.name}.`, "success");
      setDispenseTarget(null);
      await fetchQueue();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to dispense item.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (busy) return;
    const { prescription, item } = rejectTarget;
    setBusy(true);
    try {
      await rejectItem(prescription._id, item._id, rejectReason);
      showSnackbar(`Rejected ${item.name}.`, "success");
      setRejectTarget(null);
      setRejectReason("");
      await fetchQueue();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to reject item.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleHandoff = async (prescription) => {
    if (busy) return;
    setBusy(true);
    try {
      await handoffToBilling(prescription._id);
      showSnackbar(`${prescription.patientName} sent to billing.`, "success");
      await fetchQueue();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to send to billing.", "error");
      fetchQueue();
    } finally {
      setBusy(false);
    }
  };

  // An item is outstanding while the pharmacy still owes quantity: QUEUED
  // (nothing handed over) and PARTIAL (some still owed). Finished items stay
  // on the card so the pharmacist can see the outcome until it's sent to billing.
  const isOutstanding = (i) => i.status === "QUEUED" || i.status === "PARTIAL";
  const pendingRx = prescriptions
    // Send to Billing is allowed once nothing is untouched (QUEUED); partly
    // dispensed items are accepted as-is when the pharmacist sends it on.
    .map((p) => ({ prescription: p, items: p.items, queuedCount: p.items.filter((i) => i.status === "QUEUED").length }))
    .filter((g) => g.items.length > 0);

  return (
    <div className={embedded ? "" : "p-6 bg-gray-50 min-h-screen"}>
      {!embedded && (
        <div className="mb-6 flex items-center gap-3">
          <PillIcon className="text-emerald-600" />
          <div>
            <Typography variant="h5" className="font-semibold">Pharmacy Dispense Queue</Typography>
          </div>
        </div>
      )}

      {!loading && pendingRx.length === 0 && (
        <Paper className="p-6 text-center text-gray-500">
          Queue is empty — nothing waiting on the pharmacy.
        </Paper>
      )}

      {pendingRx.map(({ prescription, items, queuedCount }) => (
        <Paper key={prescription._id} className="mb-4 overflow-hidden">
          <div className="px-4 py-3 bg-emerald-50 border-b flex flex-wrap items-center gap-x-4 gap-y-1">
            <Typography variant="subtitle1" className="font-semibold">
              {prescription.patientName}
            </Typography>
            <span className="text-sm text-gray-600">{prescription.doctorName}</span>
            {prescription.diagnosis && (
              <span className="text-sm text-gray-600">Dx: {prescription.diagnosis}</span>
            )}
            <span className="text-sm text-gray-500 ml-auto">
              {items.length} medicine{items.length > 1 ? "s" : ""}
              {prescription.createdAt ? ` • ${new Date(prescription.createdAt).toLocaleString()}` : ""}
            </span>
            {queuedCount > 0 && (
              <Chip size="small" color="warning" label={`${queuedCount} pending`} />
            )}
            {queuedCount === 0 && (
              <Button size="small" variant="contained" color="success" disabled={busy} onClick={() => handleHandoff(prescription)}>
                Send to Billing
              </Button>
            )}
            {prescription.notes && (
              <p className="w-full text-xs text-gray-500">Note: {prescription.notes}</p>
            )}
          </div>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Medicine</TableCell>
                  <TableCell>Dosage</TableCell>
                  <TableCell align="right">Qty (Prescribed / Dispensed)</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
            {items.map((item) => (
              <TableRow key={item._id} hover>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.dosage || "-"} {item.frequency ? `• ${item.frequency}` : ""}</TableCell>
                <TableCell align="right">
                  {item.qtyPrescribed} / {item.qtyDispensed}
                  {item.qtyDispensed > 0 && item.qtyDispensed < item.qtyPrescribed && (
                    <p className="text-xs text-amber-600">
                      {item.qtyPrescribed - item.qtyDispensed} remaining
                    </p>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Chip size="small" label={labelFor(DISPENSE_STATUS_LABELS, item.status)} color={statusColors[item.status] || "default"} />
                </TableCell>
                <TableCell align="center">
                  {isOutstanding(item) ? (
                    <div className="flex gap-2 justify-center">
                      <Button size="small" variant="contained" disabled={busy} onClick={() => openDispenseDialog(prescription, item)}>
                        Dispense
                      </Button>
                      <Button size="small" color="error" disabled={busy} onClick={() => setRejectTarget({ prescription, item })}>
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {item.status === "REJECTED" ? (item.rejectionReason || "Rejected") : "Done"}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}

      {/* Dispense Dialog */}
      <Dialog open={Boolean(dispenseTarget)} onClose={() => setDispenseTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Dispense {dispenseTarget?.item?.name}</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-500 mb-3">
            Prescribed: {dispenseTarget?.item?.qtyPrescribed}, already dispensed: {dispenseTarget?.item?.qtyDispensed}.
            Enter less than the remaining quantity if stock is short — the rest will stay waiting in the queue.
          </p>
          <TextField
            label="Quantity to dispense"
            type="number"
            fullWidth
            value={dispenseQty}
            onChange={(e) => setDispenseQty(e.target.value)}
            inputProps={{ min: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDispenseTarget(null)}>Cancel</Button>
          <Button variant="contained" disabled={busy} onClick={handleDispense}>
            {busy ? "Dispensing…" : "Confirm Dispense"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={Boolean(rejectTarget)} onClose={() => setRejectTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject {rejectTarget?.item?.name}</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason"
            fullWidth
            multiline
            rows={2}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" disabled={busy} onClick={handleReject}>
            {busy ? "Rejecting…" : "Confirm Reject"}
          </Button>
        </DialogActions>
      </Dialog>

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
