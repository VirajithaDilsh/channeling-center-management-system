import React from "react";
import {
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

const InventoryTable = () => {
  const { medicines, deleteMedicine } = useMedicines();
  const navigate = useNavigate();

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

            const lowStock =
              med.reorderLevel &&
              parseInt(med.stockQuantity) <= parseInt(med.reorderLevel);

            return (
              <TableRow key={med._id} hover>
                <TableCell className="font-medium">{med.name}</TableCell>
                <TableCell>{med.manufacturer}</TableCell>
                <TableCell>{med.category || "—"}</TableCell>
                <TableCell>{med.batchNumber}</TableCell>
                <TableCell>{med.expiryDate}</TableCell>
                <TableCell align="right">
                  {med.stockQuantity} {med.unitType}
                </TableCell>
                <TableCell align="right">
                  ${parseFloat(med.unitPrice || 0).toFixed(2)}
                </TableCell>
                <TableCell align="right" className="font-semibold">
                  ${totalValue.toFixed(2)}
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
                    onEdit={() =>
                      navigate(`/dashboard/inventory/edit-medicine/${med._id}`)
                    }
                    onDelete={() => handleDelete(med._id)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default InventoryTable;
