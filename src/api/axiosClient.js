import axios from "axios";

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? "https://channeling-center-management-system.onrender.com"  // Render backend
  : "http://localhost:5000";  // Local backend
  
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
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
      localStorage.removeItem("userPermissions");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    return Promise.reject(err);
  }
);

export default axiosClient;
