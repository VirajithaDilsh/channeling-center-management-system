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

// Pharmacy counter's inbound queue: prescriptions with items still awaiting action
export const getPharmacyQueue = async () => {
  const res = await axiosClient.get(`${API_URL}/queue`);
  return res.data;
};

// Dispense a prescription item (fully or partially). Omit qtyDispensed to dispense in full.
export const dispenseItem = async (prescriptionId, itemId, qtyDispensed) => {
  const res = await axiosClient.post(`${API_URL}/${prescriptionId}/items/${itemId}/dispense`, { qtyDispensed });
  return res.data;
};

// Reject a prescription item outright (no stock movement, no bill line)
export const rejectItem = async (prescriptionId, itemId, reason) => {
  const res = await axiosClient.post(`${API_URL}/${prescriptionId}/items/${itemId}/reject`, { reason });
  return res.data;
};
