import React, { useEffect, useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from "@mui/material";
import PillIcon from "@mui/icons-material/Medication";
import { getPharmacyQueue, dispenseItem, rejectItem } from "../../../api/PrescriptionApi";

const statusColors = {
  QUEUED: "warning",
  DISPENSED: "success",
  PARTIAL: "info",
  REJECTED: "error",
  CANCELED: "default",
};

export default function DispenseQueue() {
  const [prescriptions, setPrescriptions] = useState([]);
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
    const { prescription, item } = dispenseTarget;
    try {
      await dispenseItem(prescription._id, item._id, Number(dispenseQty) || undefined);
      showSnackbar(`Dispensed ${item.name}.`, "success");
      setDispenseTarget(null);
      fetchQueue();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to dispense item.", "error");
    }
  };

  const handleReject = async () => {
    const { prescription, item } = rejectTarget;
    try {
      await rejectItem(prescription._id, item._id, rejectReason);
      showSnackbar(`Rejected ${item.name}.`, "success");
      setRejectTarget(null);
      setRejectReason("");
      fetchQueue();
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || "Failed to reject item.", "error");
    }
  };

  const pendingItems = prescriptions.flatMap((p) =>
    p.items.filter((i) => i.status === "QUEUED").map((item) => ({ prescription: p, item }))
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center gap-3">
        <PillIcon className="text-emerald-600" />
        <div>
          <Typography variant="h5" className="font-semibold">Pharmacy Dispense Queue</Typography>
          <p className="text-gray-500 text-sm">Prescription items waiting to be dispensed</p>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Medicine</TableCell>
              <TableCell>Dosage</TableCell>
              <TableCell align="right">Qty (Prescribed / Dispensed)</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && pendingItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Queue is empty — nothing waiting on the pharmacy.
                </TableCell>
              </TableRow>
            )}
            {pendingItems.map(({ prescription, item }) => (
              <TableRow key={item._id} hover>
                <TableCell>{prescription.patientName}</TableCell>
                <TableCell>{prescription.doctorName}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.dosage || "-"} {item.frequency ? `• ${item.frequency}` : ""}</TableCell>
                <TableCell align="right">{item.qtyPrescribed} / {item.qtyDispensed}</TableCell>
                <TableCell align="center">
                  <Chip size="small" label={item.status} color={statusColors[item.status] || "default"} />
                </TableCell>
                <TableCell align="center">
                  <div className="flex gap-2 justify-center">
                    <Button size="small" variant="contained" onClick={() => openDispenseDialog(prescription, item)}>
                      Dispense
                    </Button>
                    <Button size="small" color="error" onClick={() => setRejectTarget({ prescription, item })}>
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dispense Dialog */}
      <Dialog open={Boolean(dispenseTarget)} onClose={() => setDispenseTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Dispense {dispenseTarget?.item?.name}</DialogTitle>
        <DialogContent>
          <p className="text-sm text-gray-500 mb-3">
            Prescribed: {dispenseTarget?.item?.qtyPrescribed}, already dispensed: {dispenseTarget?.item?.qtyDispensed}.
            Enter less than the remaining quantity if stock is short — the rest stays queued as a partial dispense.
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
          <Button variant="contained" onClick={handleDispense}>Confirm Dispense</Button>
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
          <Button color="error" variant="contained" onClick={handleReject}>Confirm Reject</Button>
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
