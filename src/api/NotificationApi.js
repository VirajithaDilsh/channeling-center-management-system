import axiosClient from "./axiosClient";

const BASE_URL = "/api/notifications/inventory";

export const getInventoryNotifications = async () => {
  const res = await axiosClient.get(BASE_URL);
  return res.data;
};

export const getUnreadInventoryNotificationCount = async () => {
  const res = await axiosClient.get(`${BASE_URL}/unread-count`);
  return res.data;
};

export const markInventoryNotificationRead = async (id) => {
  const res = await axiosClient.patch(`${BASE_URL}/${encodeURIComponent(id)}/read`);
  return res.data;
};

export const markAllInventoryNotificationsRead = async () => {
  const res = await axiosClient.patch(`${BASE_URL}/read-all`);
  return res.data;
};

