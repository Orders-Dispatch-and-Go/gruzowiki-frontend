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
    Flex,
} from "antd";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cargoRequestsApi } from "../api/cargoRequests";
import type { CargoRequest } from "../types/cargo";
import type { ColumnsType } from "antd/es/table";
const { Content } = Layout;
const { Title , Text } = Typography;

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
                const errorMessage =
                    err.response?.data?.message || "Ошибка при загрузке заявок";
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

    // Функция для форматирования даты
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleDateString("ru-RU");
    };

    // Функция для форматирования даты и времени
    const formatDateTime = (timestamp: number): string => {
        return new Date(timestamp * 1000).toLocaleString("ru-RU");
    };

    const getStatusColor = (status: string): string => {
        const statusColors: { [key: string]: string } = {
            создана: "blue",
            "ждет выбора поездки": "orange",
            "ждет одобрения водителя": "gold",
            "одобрена водителем": "green",
            "отклонена водителем": "red",
            отменена: "gray",
            "доставка началась": "cyan",
            "проблема доставки": "volcano",
            завершена: "green",
        };
        return statusColors[status] || "default";
    };

    // Колонки для таблицы
    const columns: ColumnsType<CargoRequest> = [
        {
            title: "Дата создания",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 150,
            render: (createdAt: number) => <Text>{formatDate(createdAt)}</Text>,
        },
        {
            title: "Откуда",
            dataIndex: "fromStation",
            key: "fromStation",
            width: 200,
            render: (fromStation: CargoRequest["fromStation"]) => (
                <Text>{fromStation.address}</Text>
            ),
        },
        {
            title: "Куда",
            dataIndex: "toStation",
            key: "toStation",
            width: 200,
            render: (toStation: CargoRequest["toStation"]) => (
                <Text>{toStation.address}</Text>
            ),
        },
        {
            title: "Предложенное вознаграждение ₽",
            dataIndex: "price",
            key: "price",
            width: 120,
            render: (price: string, record: CargoRequest) => {
                const hasRealTripId =
                    record.tripId &&
                    !record.tripId.startsWith("000") &&
                    record.tripId !== "00000000-0000-0000-0000-000000000000";

                return (
                    <Text
                        strong
                        // style={{border: "none", }}
                    >
                        {hasRealTripId ? "Цена согласована" : `${price} руб`}
                    </Text>
                );
            },
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
            width: 200,
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>{status} </Tag>
            ),
        },
    ];

    if (!user || user.role !== "ROLE_CONSIGNER") {
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
        <Content style={{ padding: "24px", color: "#212D3B" }}>
            {/* Заголовок и кнопки действий */}
            <Row
                gutter={[16, 16]}
                // style={{ marginBottom: "24px" }}
            >
                <Col span={24}>
                    <Space
                        direction="vertical"
                        size="large"
                        style={{ width: "100%" }}
                    >
                        <Title 
                        // style={{ color: "#FFFFFF" }} 
                        level={2}>
                            Актуальные заявки
                        </Title>
                    </Space>
                </Col>
            </Row>
            <Card
                style={{
                    backgroundColor: "#293645",
                    borderRadius: 32,
                    margin: 16,
                    border: "none",
                }}
                bodyStyle={{
                    padding: 0,
                    backgroundColor: "#293645",
                    borderRadius: 32,
                    border: "none",
                }}
            >
                {/* Таблица активных заявок */}
                <Row>
                    <Col span={24}>
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
                            <div
                                style={{
                                    textAlign: "center",
                                    padding: "40px",
                                }}
                            >
                                <Spin size="large" />
                                <div style={{ marginTop: "16px" }}>
                                    <Text type="secondary">
                                        Загрузка заявок...
                                    </Text>
                                </div>
                            </div>
                        ) : activeRequests.length === 0 ? (
                            <Empty
                                description="Нет активных заявок"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            >
                                <Button
                                    type="primary"
                                    onClick={handleCreateRequest}
                                    
                                >
                                    Создать первую заявку
                                </Button>
                            </Empty>
                        ) : (
                            // <Table
                            //     columns={columns}
                            //     dataSource={activeRequests}
                            //     rowKey="id"
                            //     scroll={{ x: 1200 }}
                            //     bordered={false}
                            //     pagination={false}
                            //     size="middle"
                            // />
                            <Table
                                // className="shipper-table"
                                columns={columns}
                                dataSource={activeRequests}
                                rowKey="id"
                                pagination={false}
                                bordered={false}
                                size="middle"
                                style={{
                                    backgroundColor: "#1E2936",
                                    // color: "#E6EDF3",
                                    border: "none",
                                    borderCollapse: "collapse",
                                }}
                                components={{
                                    header: {
                                        cell: (props: any) => (
                                            <th
                                                {...props}
                                                style={{
                                                    backgroundColor: "#212D3B",
                                                    color: "#FFFFFF",
                                                    borderLeft: "none",
                                                    borderRight: "none",
                                                    border: "none",
                                                    fontWeight: 600,
                                                }}
                                            />
                                        ),
                                    },
                                    body: {
                                        cell: (props: any) => (
                                            <td
                                                {...props}
                                                style={{
                                                    backgroundColor: "#293645",
                                                    color: "#E6EDF3",
                                                    borderBottom: "#293645",
                                                }}
                                            >
                                                {React.Children.map(
                                                    props.children,
                                                    (child) =>
                                                        React.isValidElement(
                                                            child
                                                        )
                                                            ? React.cloneElement(
                                                                  child as any,
                                                                  {
                                                                      style: {
                                                                          color: "#E6EDF3",
                                                                      },
                                                                  }
                                                              )
                                                            : child
                                                )}
                                            </td>
                                        ),
                                    },
                                }}
                            />
                        )}
                    </Col>
                </Row>

                <Space
                    wrap
                    style={{
                        marginTop: "16px",
                        marginLeft: "16px",
                        marginBottom: "24px",
                    }}
                >
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleCreateRequest}
                        style={{
                            backgroundColor: "#FAAD14",
                            borderColor: "#FAAD14",
                            color: "#212D3B",
                        }}
                    >
                        Создать заявку
                    </Button>
                    <Button
                        size="large"
                        onClick={handleHistory}
                        style={{ color: "#212D3B" }}
                    >
                        История заявок
                    </Button>
                </Space>
            </Card>
        </Content>
    );
};

export default ShipperMainPage;
