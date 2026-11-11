import axiosClient from "./axiosClient";

const API_URL = "/api/reports";

export const getReportSummary = async () => (await axiosClient.get(`${API_URL}/summary`)).data;
export const getMonthlyRevenue = async (params = {}) => (await axiosClient.get(`${API_URL}/monthly`, { params })).data;
export const getRevenueByDoctor = async (params = {}) => (await axiosClient.get(`${API_URL}/by-doctor`, { params })).data;
export const compareMonths = async (monthA, monthB) =>
  (await axiosClient.get(`${API_URL}/compare`, { params: { monthA, monthB } })).data;
export const getRevenueForecast = async (horizon = 1) =>
  (await axiosClient.get(`${API_URL}/forecast`, { params: { horizon } })).data;
