// src/components/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const RequireAuth = ({ children }: { children: React.JSX.Element }) => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <div>Загрузка...</div>; // или спиннер Antd
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
