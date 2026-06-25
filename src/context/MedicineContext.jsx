import React, { createContext, useState, useContext, useEffect } from "react";
import {
    getMedicines,
    addMedicine as addApi,
    updateMedicine as updateApi,
    deleteMedicine as deleteApi
} from "../api/MedicineApi";

const MedicineContext = createContext();

export const useMedicines = () => useContext(MedicineContext);

export const MedicineProvider = ({ children }) => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // FETCH
    const fetchMedicines = async () => {
        try {
            setLoading(true);
            const data = await getMedicines();
            setMedicines(data);
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    }, []);

    // ADD
    const addMedicine = async (medicine) => {
        try {
            setActionLoading(true);
            const saved = await addApi(medicine);
            setMedicines(prev => [...prev, saved]);
        } catch (err) {
            console.error("Add error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    // UPDATE
    const updateMedicine = async (id, updatedData) => {
        try {
            setActionLoading(true);
            const res = await updateApi(id, updatedData);

            // handle both res.data or direct object
            const updated = res?.data || res;

            setMedicines(prev =>
                prev.map(m => (m._id === id ? updated : m))
            );
        } catch (err) {
            console.error("Update error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    // DELETE
    const deleteMedicine = async (id) => {
        try {
            setActionLoading(true);
            await deleteApi(id);

            setMedicines(prev => prev.filter(m => m._id !== id));
        } catch (err) {
            console.error("Delete error:", err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <MedicineContext.Provider value={{
            medicines,
            loading,
            actionLoading,
            fetchMedicines,
            addMedicine,
            updateMedicine,
            deleteMedicine
        }}>
            {children}
        </MedicineContext.Provider>
    );
};