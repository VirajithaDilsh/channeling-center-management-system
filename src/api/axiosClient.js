import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
