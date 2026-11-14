import { useCallback, useMemo, useState } from "react";
import { Alert, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WidgetCard from "../widgets/WidgetCard";
import useReportData from "./useReportData";
import { getMedicines } from "../../../api/MedicineApi";
import { getUserPermissions, hasAny } from "../../../utils/permissions";
import StockOutForecastChart from "../Inventory/StockOutForecastChart";

export default function MedicineStockOutSection() {
  const canReadInventory = hasAny(getUserPermissions(), [
    "inventory_read",
    "inventory_allow_all",
  ]);
  const [selectedMedicineId, setSelectedMedicineId] = useState("");

  const fetcher = useCallback(() => {
    if (!canReadInventory) return Promise.resolve([]);
    return getMedicines();
  }, [canReadInventory]);

  const { status, data: medicinesData, error, reload } = useReportData(
    fetcher,
    "medicines"
  );

  const medicines = useMemo(
    () => (Array.isArray(medicinesData) ? medicinesData : []),
    [medicinesData]
  );

  const effectiveSelectedId = useMemo(() => {
    if (medicines.length === 0) return "";
    const exists = medicines.some((m) => String(m._id) === String(selectedMedicineId));
    return exists ? String(selectedMedicineId) : String(medicines[0]._id);
  }, [medicines, selectedMedicineId]);

  const selectedMedicine = useMemo(
    () => medicines.find((m) => String(m._id) === effectiveSelectedId) || null,
    [medicines, effectiveSelectedId]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Typography variant="h6" className="font-semibold">
          Medicine Stock-Out Forecast
        </Typography>

        {canReadInventory && status === "success" && medicines.length > 0 && (
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 300 } }}>
            <InputLabel id="reports-stockout-medicine-label">Select Medicine</InputLabel>
            <Select
              labelId="reports-stockout-medicine-label"
              id="reports-stockout-medicine-select"
              value={effectiveSelectedId}
              label="Select Medicine"
              onChange={(e) => setSelectedMedicineId(e.target.value)}
            >
              {medicines.map((med) => (
                <MenuItem key={String(med._id)} value={String(med._id)}>
                  {med.name}
                  {med.batchNumber ? ` — Batch ${med.batchNumber}` : ""}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      {!canReadInventory ? (
        <WidgetCard
          title="Medicine Stock-Out Forecast"
          icon={<Inventory2OutlinedIcon className="text-amber-600" />}
          state="success"
        >
          <Alert severity="info">
            You do not have inventory-read permission (<code>inventory_read</code>) required to view medicine stock-out forecasts.
          </Alert>
        </WidgetCard>
      ) : status !== "success" ? (
        <WidgetCard
          title="Medicine Stock-Out Forecast"
          icon={<Inventory2OutlinedIcon className="text-amber-600" />}
          state={status}
          error={error}
          onRetry={reload}
        />
      ) : medicines.length === 0 ? (
        <WidgetCard
          title="Medicine Stock-Out Forecast"
          icon={<Inventory2OutlinedIcon className="text-amber-600" />}
          state="success"
        >
          <Alert severity="info">
            No medicines are currently available in inventory to forecast.
          </Alert>
        </WidgetCard>
      ) : (
        selectedMedicine && <StockOutForecastChart medicine={selectedMedicine} />
      )}
    </div>
  );
}

