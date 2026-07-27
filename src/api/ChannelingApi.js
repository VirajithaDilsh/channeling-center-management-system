import axiosClient from "./axiosClient";

const API_URL = "/patient";

// Get channeling/visit history for a patient, most recent first
export const getChannelingHistory = async (patientId) => {
  const res = await axiosClient.get(`${API_URL}/${patientId}/channeling-history`);
  return res.data;
};

// Record a new channeling visit for a patient
export const addChannelingRecord = async (patientId, record) => {
  const res = await axiosClient.post(`${API_URL}/${patientId}/channeling-history`, record);
  return res.data;
};
