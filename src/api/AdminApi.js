import axios from "axios";

const BASE_URL = "http://localhost:5000/api/admin";

// CREATE ADMIN
export const createAdmin = async (adminData) => {
  const response = await axios.post(BASE_URL, adminData);
  return response.data;
};

// GET ALL ADMINS
export const getAdmins = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

// DELETE ADMIN
export const deleteAdmin = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// GET SINGLE ADMIN
export const getAdminById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

// UPDATE ADMIN
export const updateAdmin = async (id, updatedData) => {
  const response = await axios.put(
    `${BASE_URL}/${id}`,
    updatedData
  );

  return response.data;
};