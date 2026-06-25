import React, { createContext, useState, useContext } from "react";

// Create context
const MedicineContext = createContext();

// Custom hook to use medicines
export const useMedicines = () => useContext(MedicineContext);

// Provider component
export const MedicineProvider = ({ children }) => {
    const [medicines, setMedicines] = useState([]);

    const addMedicine = (newMedicine) => {
        setMedicines(prev => {
            // Check if medicine with same name + manufacturer + batch exists
            const existingIndex = prev.findIndex(
                m =>
                    m.name === newMedicine.name &&
                    m.manufacturer === newMedicine.manufacturer &&
                    m.batchNumber === newMedicine.batchNumber
            );

            if (existingIndex !== -1) {
                // Update existing quantity
                const updated = [...prev];
                updated[existingIndex].stockQuantity =
                    parseInt(updated[existingIndex].stockQuantity) + parseInt(newMedicine.stockQuantity);

                // Optional: update unit price if you want latest
                updated[existingIndex].unitPrice = newMedicine.unitPrice;

                return updated;
            } else {
                // Add new medicine with unique id
                return [
                    ...prev,
                    {
                        ...newMedicine,
                        id: Date.now() // simple unique id
                    }
                ];
            }
        });
    };

    return (
        <MedicineContext.Provider value={{ medicines, addMedicine }}>
            {children}
        </MedicineContext.Provider>
    );
};