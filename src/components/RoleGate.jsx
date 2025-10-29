import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleGate({ allow = [], children }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" replace />;
  if (!allow.includes(role)) return <Navigate to="/" replace />;
  return children;
}
