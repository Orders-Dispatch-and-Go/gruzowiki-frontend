// src/components/HomeRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin, Flex, Typography, Card } from "antd";

const { Text } = Typography;

export default function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        style={{ height: "100vh" }}
        gap="small"
      >
        <Spin size="large" />
        <Text type="secondary">Проверка авторизации...</Text>
      </Flex>
    );
  }

  return (
    <Flex 
      justify="center" 
      align="center" 
      style={{ height: "100vh" }}
    >
      <Card style={{ textAlign: "center" }}>
        <Spin size="large" style={{ marginBottom: 16 }} />
        <Text>Перенаправление...</Text>
      </Card>
    </Flex>
  );
}