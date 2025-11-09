// pages/ShipperMainPage.tsx
import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Button,
  List,
  Tag,
  Space,
  Typography,
  Spin,
  Alert,
  Empty,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cargoRequestsApi } from "../api/cargoRequests";
import type { CargoRequest } from "../types/cargo";

const { Content } = Layout;
const { Title, Text } = Typography;

const ShipperMainPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRequests, setActiveRequests] = useState<CargoRequest[]>([]);

  // Загрузка активных заявок
  useEffect(() => {
    const loadActiveRequests = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await cargoRequestsApi.getActiveCargoRequests(
          parseInt(user.id)
        );
        setActiveRequests(response.cargoRequests);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Ошибка при загрузке заявок";
        setError(errorMessage);
        console.error("Error loading cargo requests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadActiveRequests();
  }, [user?.id]);

  // Функции для навигации
  const handleCreateRequest = () => {
    navigate("/shipper/create-request");
  };

  const handleHistory = () => {
    navigate("/shipper/history");
  };

  const handleProfile = () => {
    navigate("/shipper/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleRequestDetails = (requestId: string) => {
    navigate(`/shipper/request/${requestId}`);
  };

  // Функция для форматирования даты
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleString("ru-RU");
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      "создана": "blue",
      "ждет выбора поездки": "orange",
      "ждет одобрения водителя": "gold",
      "одобрена водителем": "green",
      "отклонена водителем": "red",
      "отменена": "gray",
      "доставка началась": "cyan",
      "проблема доставки": "volcano",
      "завершена": "green",
    };
    return statusColors[status] || "default";
  };

  // Функция для отображения информации о цене
  const renderPriceInfo = (request: CargoRequest): string => {
    if (request.actualTripId) {
      return "Цена согласована";
    }
    return `Макс. цена: ${request.maxPrice} руб`;
  };

  if (!user || user.role !== 'ROLE_CONSIGNER') {
    return (
      <Content style={{ padding: "20px" }}>
        <Alert
          message="Доступ запрещен"
          description="Эта страница доступна только грузоотправителям"
          type="error"
          showIcon
        />
      </Content>
    );
  }

  return (
    <Content style={{ padding: "24px" }}>
      {/* Заголовок и кнопки действий */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Title level={2}>Главная страница грузоотправителя</Title>
            
            <Space wrap>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={handleCreateRequest}
              >
                Создать заявку
              </Button>
              <Button
                icon={<HistoryOutlined />}
                size="large"
                onClick={handleHistory}
              >
                История заявок
              </Button>
              <Button
                icon={<UserOutlined />}
                size="large"
                onClick={handleProfile}
              >
                Личный кабинет
              </Button>
              <Button
                icon={<LogoutOutlined />}
                size="large"
                danger
                onClick={handleLogout}
              >
                Выйти
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>

      {/* Список активных заявок */}
      <Row>
        <Col span={24}>
          <Card title="Активные заявки" bordered={false}>
            {error && (
              <Alert
                message="Ошибка загрузки"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: "16px" }}
                closable
                onClose={() => setError(null)}
              />
            )}

            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
                <div style={{ marginTop: "16px" }}>
                  <Text type="secondary">Загрузка заявок...</Text>
                </div>
              </div>
            ) : activeRequests.length === 0 ? (
              <Empty
                description="Нет активных заявок"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button type="primary" onClick={handleCreateRequest}>
                  Создать первую заявку
                </Button>
              </Empty>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={activeRequests}
                renderItem={(request) => (
                  <List.Item
                    actions={[
                      <Button
                        key="details"
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleRequestDetails(request.id)}
                      >
                        Подробнее
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>
                            Заявка #{request.id.slice(0, 8)}
                          </Text>
                          <Tag color={getStatusColor(request.status)}>
                            {request.status}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text>
                            <strong>От:</strong> {request.fromStation.address}
                          </Text>
                          <Text>
                            <strong>До:</strong> {request.toStation.address}
                          </Text>
                          <Text>
                            <strong>Дедлайн:</strong> {formatDate(request.deadline)}
                          </Text>
                          {request.actualTripId && (
                            <Text>
                              <strong>Начало поездки:</strong>{" "}
                              {formatDate(request.createdAt)}
                            </Text>
                          )}
                          <Text>
                            <strong>{renderPriceInfo(request)}</strong>
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </Content>
  );
};

export default ShipperMainPage;