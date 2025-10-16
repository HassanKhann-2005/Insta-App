import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { currentUser } = useSelector((state) => state.app);

  // If not logged in → redirect to login page
  if (!currentUser) {
    return <Navigate to="/users/login" replace />;
  }

  // Else → allow access
  return <Outlet />;
};

export default ProtectedRoute;
