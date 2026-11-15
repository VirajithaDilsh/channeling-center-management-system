import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMedicines } from "../../context/MedicineContext.jsx";
import TableActionButtons from "../TableActionButton.jsx";
import {
  isLowStock,
  formatColomboYmd,
  getExpiryStatus,
  EXPIRY_STATUS_LABELS,
  EXPIRY_STATUS_CLASSES,
} from "../../utils/inventory";
import { getViewer } from "../../utils/permissions";
import { formatLkr } from "../../utils/formatMoney";

const InventoryTable = ({ medicines: medicinesProp, thresholdDays = 30 }) => {
  const { medicines: allMedicines, deleteMedicine } = useMedicines();
  const medicines = medicinesProp ?? allMedicines;
  const navigate = useNavigate();
  const [viewMed, setViewMed] = useState(null);
  // Backend: PUT/DELETE need inventory_edit (or allow_all). Everyone who can
  // see the table can use View; Edit/Delete are only shown with edit access.
  const canEdit = getViewer().can(["inventory_edit", "inventory_allow_all"]);

  if (!medicines || medicines.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
        No medicines available in inventory.
      </div>
    );
  }

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this medicine?",
    );

    if (!confirmDelete) return;

    try {
      await deleteMedicine(id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Medicine</TableCell>
            <TableCell>Manufacturer</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Batch</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell align="right">Unit Price</TableCell>
            <TableCell align="right">Total Value</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {medicines.map((med) => {
            const totalValue =
              parseFloat(med.stockQuantity || 0) *
              parseFloat(med.unitPrice || 0);

            const lowStock = isLowStock(med);
            const expiryStatus = getExpiryStatus(med, thresholdDays);
            const expiryLabel = EXPIRY_STATUS_LABELS[expiryStatus] || "Normal";
            const expiryClass = EXPIRY_STATUS_CLASSES[expiryStatus] || EXPIRY_STATUS_CLASSES.NORMAL;
            const formattedExpiry = formatColomboYmd(med.expiryDate) || "—";

            return (
              <TableRow key={med._id} hover>
                <TableCell className="font-medium">{med.name}</TableCell>
                <TableCell>{med.manufacturer}</TableCell>
                <TableCell>{med.category || "—"}</TableCell>
                <TableCell>{med.batchNumber}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <span>{formattedExpiry}</span>
                    {med.expiryDate && (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-lg ${expiryClass}`}>
                        {expiryLabel}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell align="right">
                  {med.stockQuantity} {med.unitType}
                </TableCell>
                <TableCell align="right">
                  {formatLkr(med.unitPrice)}
                </TableCell>
                <TableCell align="right" className="font-semibold">
                  {formatLkr(totalValue)}
                </TableCell>
                <TableCell align="center">
                  {lowStock ? (
                    <span className="inline-flex items-center text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Low Stock
                    </span>
                  ) : (
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                      In Stock
                    </span>
                  )}
                </TableCell>
                <TableCell align="center">
                  <TableActionButtons
                    onView={() => setViewMed(med)}
                    onEdit={
                      canEdit
                        ? () => navigate(`/dashboard/inventory/edit-medicine/${med._id}`)
                        : undefined
                    }
                    onDelete={canEdit ? () => handleDelete(med._id) : undefined}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Dialog open={Boolean(viewMed)} onClose={() => setViewMed(null)} fullWidth maxWidth="sm">
        <DialogTitle>Medicine Details</DialogTitle>
        <DialogContent dividers>
          {viewMed && (
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Name", viewMed.name],
                ["Generic Name", viewMed.genericName],
                ["Manufacturer", viewMed.manufacturer],
                ["Category", viewMed.category],
                ["Batch Number", viewMed.batchNumber],
                ["Expiry Date", formatColomboYmd(viewMed.expiryDate)],
                ["Stock", viewMed.stockQuantity != null ? `${viewMed.stockQuantity} ${viewMed.unitType || ""}` : null],
                ["Reorder Level", viewMed.reorderLevel],
                ["Unit Price", formatLkr(viewMed.unitPrice)],
                [
                  "Total Value",
                  formatLkr(parseFloat(viewMed.stockQuantity || 0) * parseFloat(viewMed.unitPrice || 0)),
                ],
                ["Storage Condition", viewMed.storageCondition],
                [
                  "Prescription Required",
                  viewMed.prescriptionRequired == null ? null : viewMed.prescriptionRequired ? "Yes" : "No",
                ],
                ["Description", viewMed.description],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium break-words">{value || value === 0 ? value : "—"}</dd>
                </div>
              ))}
            </dl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewMed(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </TableContainer>
  );
};

export default InventoryTable;
