import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ requiredPermission, children }) => {
  const token = localStorage.getItem("authToken");
  const permissions = JSON.parse(localStorage.getItem("userPermissions") || "[]");
  const required = Array.isArray(requiredPermission)
    ? requiredPermission
    : requiredPermission
    ? [requiredPermission]
    : [];

  if (!token) return <Navigate to="/" replace />;
  if (required.length && !required.some((p) => permissions.includes(p))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
