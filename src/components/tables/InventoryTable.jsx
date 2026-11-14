import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMedicines } from "../../context/MedicineContext.jsx";
import TableActionButtons from "../TableActionButton.jsx";
import StockOutForecastChart from "../../pages/dashboard/Inventory/StockOutForecastChart.jsx";
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
  const [forecastMedicine, setForecastMedicine] = useState(null);
  // Backend: PUT/DELETE need inventory_edit (or allow_all). Read-only viewers
  // get no Actions column.
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
    <>
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
            <TableCell align="center">Forecast</TableCell>
            {canEdit && <TableCell align="center">Actions</TableCell>}
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
                  <Tooltip title="View Stock-Out Forecast">
                    <IconButton
                      size="small"
                      color="primary"
                      aria-label={`View stock-out forecast for ${med.name}`}
                      onClick={() => setForecastMedicine(med)}
                    >
                      <ShowChartIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
                {canEdit && (
                  <TableCell align="center">
                    <TableActionButtons
                      onEdit={() =>
                        navigate(`/dashboard/inventory/edit-medicine/${med._id}`)
                      }
                      onDelete={() => handleDelete(med._id)}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>

    <Dialog
      open={Boolean(forecastMedicine)}
      onClose={() => setForecastMedicine(null)}
      maxWidth="md"
      fullWidth
    >
      <DialogContent sx={{ p: 0 }}>
        {forecastMedicine && (
          <StockOutForecastChart
            medicine={forecastMedicine}
            thresholdDays={thresholdDays}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={() => setForecastMedicine(null)}>Close</Button>
      </DialogActions>
    </Dialog>
    </>
  );
};

export default InventoryTable;
