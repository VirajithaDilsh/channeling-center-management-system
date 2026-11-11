// src/api/MedicineApi.js

import axiosClient from "./axiosClient";

const API_URL = "/api/medicines";

//GET
export const getMedicines = async () => {
    const res = await axiosClient.get(API_URL);
    return res.data;
};

// ADD
export const addMedicine = async (data) => {
    const res = await axiosClient.post(API_URL, data);
    return res.data;
};

// UPDATE
export const updateMedicine = async (id, data) => {
    const res = await axiosClient.put(`${API_URL}/${id}`, data);
    return res.data;
};

// DELETE
export const deleteMedicine = async (id) => {
    const res = await axiosClient.delete(`${API_URL}/${id}`);
    return res.data;
};
