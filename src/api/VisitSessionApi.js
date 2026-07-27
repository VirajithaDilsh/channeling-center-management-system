import axiosClient from "./axiosClient";

const API_URL = "/api/visit-sessions";

// List visit sessions, optionally filtered by status (e.g. READY_FOR_PAYMENT) or patientId
export const listVisitSessions = async (params = {}) => {
  const res = await axiosClient.get(API_URL, { params });
  return res.data;
};

export const getVisitSession = async (id) => {
  const res = await axiosClient.get(`${API_URL}/${id}`);
  return res.data;
};

export const getVisitSessionByAppointment = async (appointmentId) => {
  const res = await axiosClient.get(`${API_URL}/by-appointment/${appointmentId}`);
  return res.data;
};

// Doctor closes the consult with no further prescriptions pending
export const finalizeConsultation = async (id) => {
  const res = await axiosClient.patch(`${API_URL}/${id}/finalize-consultation`);
  return res.data;
};

// Collect a full or partial payment against the session's balance
export const addPayment = async (id, payment) => {
  const res = await axiosClient.post(`${API_URL}/${id}/payments`, payment);
  return res.data;
};

export const cancelVisitSession = async (id, reason) => {
  const res = await axiosClient.post(`${API_URL}/${id}/cancel`, { reason });
  return res.data;
};
