import axiosClient from "./axiosClient";

const BASE_URL = "/api/roles";
const PERMISSIONS_URL = "/api/permissions";

// CREATE ROLE
export const createRole = async (roleData) => {
  const response = await axiosClient.post(BASE_URL, roleData);
  return response.data;
};

// GET ALL ROLES
export const getRoles = async () => {
  const response = await axiosClient.get(BASE_URL);
  return response.data;
};

// GET SINGLE ROLE
export const getRoleById = async (id) => {
  const response = await axiosClient.get(`${BASE_URL}/${id}`);
  return response.data;
};

// UPDATE ROLE
export const updateRole = async (id, updatedData) => {
  const response = await axiosClient.put(`${BASE_URL}/${id}`, updatedData);
  return response.data;
};

// DELETE ROLE
export const deleteRole = async (id) => {
  const response = await axiosClient.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// GET PERMISSION CATALOG
export const getPermissionCatalog = async () => {
  const response = await axiosClient.get(PERMISSIONS_URL);
  return response.data;
};
