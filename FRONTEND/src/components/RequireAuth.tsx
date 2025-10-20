// src/components/RequireAuth.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin, Flex, Typography } from "antd";

const { Text } = Typography;

export const RequireAuth = ({ children }: { children: React.JSX.Element }) => {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        style={{ height: "100vh" }}
        gap="small"
      >
        <Spin size="large" />
        <Text type="secondary">Загрузка...</Text>
      </Flex>
    );
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};