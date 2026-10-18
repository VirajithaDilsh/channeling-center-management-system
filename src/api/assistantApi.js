import axiosClient from "./axiosClient";

const API_URL = "/api/assistant";

export const getAssistantStatus = async () => (await axiosClient.get(`${API_URL}/status`)).data;

// context is the { tool, params } returned by the previous answer, so follow-ups work.
export const askAssistant = async (message, context) =>
  (await axiosClient.post(`${API_URL}/chat`, { message, context })).data;
