import axiosClient from "./axiosClient";

const API_URL = "/api/doctors";

// Get all doctors
export const getDoctors = async () => {
  const res = await axiosClient.get(API_URL);
  return res.data;
};
