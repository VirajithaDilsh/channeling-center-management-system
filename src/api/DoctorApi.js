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
