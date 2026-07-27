import axios from "axios";

const BASE_URL = "http://localhost:5000/api/roles";
const PERMISSIONS_URL = "http://localhost:5000/api/permissions";

// CREATE ROLE
export const createRole = async (roleData) => {
  const response = await axios.post(BASE_URL, roleData);
  return response.data;
};

// GET ALL ROLES
export const getRoles = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

// GET SINGLE ROLE
export const getRoleById = async (id) => {
  const response = await axios.get(`${BASE_URL}/${id}`);
  return response.data;
};

// UPDATE ROLE
export const updateRole = async (id, updatedData) => {
  const response = await axios.put(`${BASE_URL}/${id}`, updatedData);
  return response.data;
};

// DELETE ROLE
export const deleteRole = async (id) => {
  const response = await axios.delete(`${BASE_URL}/${id}`);
  return response.data;
};

// GET PERMISSION CATALOG
export const getPermissionCatalog = async () => {
  const response = await axios.get(PERMISSIONS_URL);
  return response.data;
};
