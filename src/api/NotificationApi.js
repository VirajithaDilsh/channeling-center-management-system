import axiosClient from "./axiosClient";

const BASE_URL = "/api/notifications/inventory";

export const getInventoryNotifications = async () => {
  const res = await axiosClient.get(BASE_URL);
  return res.data;
};
