import axiosClient from "./axiosClient";

const BASE_URL = "/api/contact";

// Public endpoint — no auth required.
export const sendContactMessage = async (payload) => {
  const response = await axiosClient.post(BASE_URL, payload);
  return response.data;
};
