import axiosClient from "./axiosClient";

const BASE_URL = "/api/admin";

// CREATE ADMIN
export const createAdmin = async (adminData) => {
  const response = await axiosClient.post(BASE_URL, adminData);
  return response.data;
};

// GET ALL ADMINS
export const getAdmins = async () => {
  const response = await axiosClient.get(BASE_URL);
  return response.data;
};

// DELETE ADMIN
export const deleteAdmin = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// GET SINGLE ADMIN
export const getAdminById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

// UPDATE ADMIN
export const updateAdmin = async (id, updatedData) => {
  const response = await axiosClient.put(
    `${BASE_URL}/${id}`,
    updatedData
  );

  return response.data;
};
