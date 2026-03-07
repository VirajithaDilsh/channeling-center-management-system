import React from 'react';
import SearchBar from "../../../components/SearchBar.jsx";
import AddButton from "../../../components/AddButton.jsx";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
    const navigate = useNavigate();
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

            {/* Search + Add Button Row */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

                {/* Search */}
                <div className="w-full md:w-1/2">
                    <SearchBar
                        placeholder="Search Medicines..."
                        onChange={(e) => console.log(e.target.value)}
                    />
                </div>

                {/* Add Button */}
                <div className="flex justify-end">
                    <AddButton
                        label="Add Medicine"
                        onClick={() => navigate("/dashboard/inventory/add-medicine")}
                        bgColor="#1FB1F9"
                    />
                </div>

            </div>

        </div>
    );
};

export default Inventory;