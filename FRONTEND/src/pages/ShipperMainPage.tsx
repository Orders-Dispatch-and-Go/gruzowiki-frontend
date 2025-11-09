// pages/ShipperMainPage.tsx
import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Button,
  Table,
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
import type { ColumnsType } from "antd/es/table";

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
    return new Date(timestamp * 1000).toLocaleDateString("ru-RU");
  };

  // Функция для форматирования даты и времени
  const formatDateTime = (timestamp: number): string => {
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

  // Колонки для таблицы
  const columns: ColumnsType<CargoRequest> = [
    
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (createdAt: number) => (
        <Text>{formatDate(createdAt)}</Text>
      ),
    },
    {
      title: 'ID заявки',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Text strong>#{id.slice(0, 8)}</Text>
      ),
    },
    {
      title: 'Откуда',
      dataIndex: 'fromStation',
      key: 'fromStation',
      width: 200,
      render: (fromStation: CargoRequest['fromStation']) => (
        <Text>{fromStation.address}</Text>
      ),
    },
    {
      title: 'Куда',
      dataIndex: 'toStation',
      key: 'toStation',
      width: 200,
      render: (toStation: CargoRequest['toStation']) => (
        <Text>{toStation.address}</Text>
      ),
    },
    {
      title: 'Дедлайн',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 150,
      render: (deadline: number) => (
        <Text>{formatDate(deadline)}</Text>
      ),
    },
    {
      title: 'Макс. цена',
      dataIndex: 'maxPrice',
      key: 'maxPrice',
      width: 120,
      render: (maxPrice: string, record: CargoRequest) => (
        <Text strong>
          {record.actualTripId ? "Цена согласована" : `${maxPrice} руб`}
        </Text>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
  ];

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
            <Title level={2}>Актуальные заявки</Title>
            
            
          </Space>
        </Col>
      </Row>

      {/* Таблица активных заявок */}
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
              <Table
                columns={columns}
                dataSource={activeRequests}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `Показано ${range[0]}-${range[1]} из ${total} заявок`,
                }}
                size="middle"
              />
            )}
          </Card>
        </Col>
      </Row>

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
            </Space>
    </Content>
  );
};

export default ShipperMainPage;