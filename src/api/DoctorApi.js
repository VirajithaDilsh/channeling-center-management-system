import axiosClient from "./axiosClient";

const API_URL = "/api/doctors";

// Get all doctors
export const getDoctors = async () => {
  const res = await axiosClient.get(API_URL);
  return res.data;
};

// Delete a doctor
export const deleteDoctor = async (id) => {
  const res = await axiosClient.delete(`${API_URL}/${id}`);
  return res.data;
};

// Create a doctor (also provisions the doctor's login account)
export const createDoctor = async (doctorData) => {
  const res = await axiosClient.post(API_URL, doctorData);
  return res.data;
};

// Get a single doctor by id
export const getDoctorById = async (id) => {
  const res = await axiosClient.get(`${API_URL}/${id}`);
  return res.data;
};

// Update a doctor
export const updateDoctor = async (id, doctorData) => {
  const res = await axiosClient.put(`${API_URL}/${id}`, doctorData);
  return res.data;
};

// --- Doctor self-service (Settings page: Profile & Availability) ---

// Get my own doctor profile (doctor_portal permission)
export const getMyDoctorProfile = async () => {
  const res = await axiosClient.get(`${API_URL}/me`);
  return res.data;
};

// Update my own doctor profile (phone/experience only)
export const updateMyDoctorProfile = async (updatedData) => {
  const res = await axiosClient.patch(`${API_URL}/me`, updatedData);
  return res.data;
};

// Get my own availability schedule
export const getMySchedules = async () => {
  const res = await axiosClient.get(`${API_URL}/me/schedules`);
  return res.data;
};

// Add an availability slot
export const addMySchedule = async (scheduleData) => {
  const res = await axiosClient.post(`${API_URL}/me/schedules`, scheduleData);
  return res.data;
};

// Update an availability slot
export const updateMySchedule = async (id, scheduleData) => {
  const res = await axiosClient.put(`${API_URL}/me/schedules/${id}`, scheduleData);
  return res.data;
};

// Delete an availability slot
export const deleteMySchedule = async (id) => {
  const res = await axiosClient.delete(`${API_URL}/me/schedules/${id}`);
  return res.data;
};
