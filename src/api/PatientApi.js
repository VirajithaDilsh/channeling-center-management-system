import axios from 'axios';

const API_URL = "http://localhost:5000/patient";

// Get all patients
export const getPatients = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

// Get single patient
export const getPatientById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// Create new patient
export const createPatient = async (patient) => {
  const res = await axios.post(API_URL, patient);
  return res.data;
};

// Update patient
export const updatePatient = async (id, patient) => {
  const res = await axios.put(`${API_URL}/${id}`, patient);
  return res.data;
};

// Delete patient
export const deletePatient = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};