// src/components/HomeRedirect.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spin, Flex, Typography, Card } from "antd";

const { Text } = Typography;

export default function HomeRedirect() {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      // Редирект в зависимости от роли пользователя
      if (user?.role === 'ROLE_CARRIER') {
        navigate("/carrier/home", { replace: true });
      } else {
        // По умолчанию на страницу грузоотправителя
        navigate("/shipper/home", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, loading, navigate, user]);

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