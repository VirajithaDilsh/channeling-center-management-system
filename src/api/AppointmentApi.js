import axiosClient from "./axiosClient";

const API_URL = "/api/appointments";

// Get all appointments
export const getAppointments = async () => {
  const res = await axiosClient.get(API_URL);
  return res.data;
};

// Create a new appointment
export const createAppointment = async (appointment) => {
  const res = await axiosClient.post(API_URL, appointment);
  return res.data;
};

// Update an appointment (e.g. status change)
export const updateAppointment = async (id, appointment) => {
  const res = await axiosClient.put(`${API_URL}/${id}`, appointment);
  return res.data;
};

// Delete/cancel an appointment
export const deleteAppointment = async (id) => {
  const res = await axiosClient.delete(`${API_URL}/${id}`);
  return res.data;
};
