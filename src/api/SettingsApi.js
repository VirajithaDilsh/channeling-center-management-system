import axiosClient from "./axiosClient";

const BASE_URL = "/api/settings";

// Non-sensitive branding/currency config — safe to call before login and
// for any authenticated role.
export const getPublicSettings = async () => {
  const response = await axiosClient.get(`${BASE_URL}/public`);
  return response.data;
};

// Full settings document — requires settings_read/allow_all.
export const getSettings = async () => {
  const response = await axiosClient.get(BASE_URL);
  return response.data;
};

// Requires settings_write/edit/allow_all.
export const updateSettings = async (updatedData) => {
  const response = await axiosClient.put(BASE_URL, updatedData);
  return response.data;
};
