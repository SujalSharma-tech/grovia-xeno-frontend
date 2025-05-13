import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@/stores/useAuthStore";

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  if (!isAuthenticated && !checkAuth()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
