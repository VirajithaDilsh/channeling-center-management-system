import axiosClient from "./axiosClient";

const API_URL = "/api/prescriptions";

// Get all prescriptions for a patient, most recent first
export const getPrescriptionsByPatient = async (patientId) => {
  const res = await axiosClient.get(`${API_URL}/patient/${patientId}`);
  return res.data;
};

// Create a new prescription
export const createPrescription = async (prescription) => {
  const res = await axiosClient.post(API_URL, prescription);
  return res.data;
};
