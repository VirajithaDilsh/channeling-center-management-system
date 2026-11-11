import axiosClient from "./axiosClient";

const API_URL = "/patient";

// Get all patients
export const getPatients = async () => {
  const res = await axiosClient.get(API_URL);
  return res.data;
};

// Get single patient
export const getPatientById = async (id) => {
  const res = await axiosClient.get(`${API_URL}/${id}`);
  return res.data;
};

// Create new patient
export const createPatient = async (patient) => {
  const res = await axiosClient.post(API_URL, patient);
  return res.data;
};

// Update patient
export const updatePatient = async (id, patient) => {
  const res = await axiosClient.put(`${API_URL}/${id}`, patient);
  return res.data;
};

// Delete patient
export const deletePatient = async (id) => {
  const res = await axiosClient.delete(`${API_URL}/${id}`);
  return res.data;
};
