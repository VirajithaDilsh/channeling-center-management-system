import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ requiredPermission, children }) => {
  const token = localStorage.getItem("authToken");
  const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");

  if (!token) return <Navigate to="/" replace />;
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
