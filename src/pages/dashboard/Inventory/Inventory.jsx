import React, { useEffect, useState } from 'react';
import SearchBar from "../../../components/SearchBar.jsx";
import AddButton from "../../../components/AddButton.jsx";
import { useNavigate } from "react-router-dom";
import InventoryTable from "../../../components/tables/InventoryTable.jsx"; // import the table
import { useMedicines } from "../../../context/MedicineContext.jsx";
import { getViewer } from "../../../utils/permissions";
import { getExpiryStatus } from "../../../utils/inventory";
import { getSettings } from "../../../api/SettingsApi";

const Inventory = () => {
    const navigate = useNavigate();
    const { medicines } = useMedicines();
    const [searchQuery, setSearchQuery] = useState("");
    const [expiryFilter, setExpiryFilter] = useState("ALL");
    const [thresholdDays, setThresholdDays] = useState(30);
    const canWrite = getViewer().can(["inventory_write", "inventory_allow_all"]);

    useEffect(() => {
        if (!getViewer().can(["settings_read", "settings_allow_all"])) return;
        getSettings()
            .then((s) => {
                const days = Number(s?.inventoryNotifications?.thresholdDays);
                if (Number.isFinite(days) && days >= 1) setThresholdDays(days);
            })
            .catch(() => {});
    }, []);

    // Filter medicines based on search and expiry status
    const q = searchQuery.trim().toLowerCase();
    const filteredMedicines = medicines.filter((med) => {
        const matchesSearch =
            (med.name || "").toLowerCase().includes(q) ||
            (med.manufacturer || "").toLowerCase().includes(q) ||
            (med.batchNumber || "").toLowerCase().includes(q) ||
            (med.category || "").toLowerCase().includes(q);
        if (!matchesSearch) return false;
        if (expiryFilter === "ALL") return true;
        return getExpiryStatus(med, thresholdDays) === expiryFilter;
    });

    return (
        <div className="space-y-4">

            {/* Title */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-semibold text-start">
                    Medicine Inventory
                </h1>

                <p className="text-sm sm:text-base text-start mt-1 text-gray-600">
                    Manage the clinic's stock of medicines.
                </p>
            </div>

            {/* Search + Filter + Add Button Row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                {/* Search + Expiry Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    <div className="w-full sm:w-80">
                        <SearchBar
                            placeholder="Search Medicines..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        aria-label="Filter by expiry status"
                        value={expiryFilter}
                        onChange={(e) => setExpiryFilter(e.target.value)}
                        className="h-[42px] w-full sm:w-48 px-3 py-2 bg-white border border-gray-400 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="ALL">All Expiry Status</option>
                        <option value="EXPIRED">Expired</option>
                        <option value="URGENT">Urgent (0–7 days)</option>
                        <option value="EXPIRING_SOON">Expiring Soon</option>
                        <option value="NORMAL">Normal</option>
                    </select>
                </div>

                {/* Add Button */}
                {canWrite && (
                    <div className="flex justify-end shrink-0">
                        <AddButton
                            label="Add Medicine"
                            onClick={() => navigate("/dashboard/inventory/add-medicine")}
                        />
                    </div>
                )}

            </div>

            {/* Inventory Table */}
            <div className="mt-4">
                <InventoryTable medicines={filteredMedicines} thresholdDays={thresholdDays} />
            </div>

        </div>
    );
};

export default Inventory;