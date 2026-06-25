// src/api/MedicineApi.js

import axios from "axios";

const API_URL = "https://musical-giggle-q7xx6pvw47vr369gj-5000.app.github.dev/api/medicines";

//GET
export const getMedicines = async () => {
    const res = await axios.get(API_URL);
    return res.data;
};

// ADD
export const addMedicine = async (data) => {
    const res = await axios.post(API_URL, data);
    return res.data;
};

// UPDATE
export const updateMedicine = async (id, data) => {
    const res = await axios.put(`${API_URL}/${id}`, data);
    return res.data;
};

// DELETE
export const deleteMedicine = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};