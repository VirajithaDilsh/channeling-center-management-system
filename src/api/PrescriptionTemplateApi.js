import axiosClient from "./axiosClient";

const API_URL = "/api/prescription-templates";

// The calling doctor's own templates. Each item carries a live `issue`
// (DELETED / EXPIRED / OUT_OF_STOCK / null) reflecting current inventory.
export const getPrescriptionTemplates = async (search = "") => {
  const res = await axiosClient.get(API_URL, { params: search ? { search } : {} });
  return res.data;
};

export const createPrescriptionTemplate = async (template) => {
  const res = await axiosClient.post(API_URL, template);
  return res.data;
};

export const updatePrescriptionTemplate = async (id, template) => {
  const res = await axiosClient.put(`${API_URL}/${id}`, template);
  return res.data;
};

export const deletePrescriptionTemplate = async (id) => {
  const res = await axiosClient.delete(`${API_URL}/${id}`);
  return res.data;
};
