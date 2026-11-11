import axiosClient from "./axiosClient";

// Search the ICD-10-CM catalog by code ("E11", "E11.9") or description words
// ("type 2 diabetes"). Returns [{ code, description }], at most `limit` rows.
export const searchIcd10 = async (q, limit = 20) => {
  const res = await axiosClient.get("/api/icd10", { params: { q, limit } });
  return res.data;
};
