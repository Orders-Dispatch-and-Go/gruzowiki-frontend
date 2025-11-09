import React, { useState, useEffect } from "react";
import {
    Card,
    Form,
    Input,
    Button,
    DatePicker,
    InputNumber,
    Space,
    Typography,
    Divider,
    Alert,
    Row,
    Col,
    message,
    Select,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cargoRequestsApi } from "../api/cargoRequests";
import type { CargoItem, Recipient, CargoType } from "../types/cargo";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CargoFormItem extends Omit<CargoItem, "cargoType"> {
    cargoType: number;
    key: number;
}

const ShipperCreateRequestPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);

    const [cargoItems, setCargoItems] = useState<CargoFormItem[]>([
        {
            key: 1,
            length: 10,
            height: 10,
            width: 10,
            weight: 1,
            cargoType: 1,
            description: "",
            worth: 0,
        },
    ]);

    // Загрузка типов грузов
    useEffect(() => {
        const loadCargoTypes = async () => {
            try {
                const response = await cargoRequestsApi.getCargoTypes();
                setCargoTypes(response.cargoTypes);
            } catch (error) {
                console.error("Error loading cargo types:", error);
                message.error("Ошибка загрузки типов грузов");
            }
        };

        loadCargoTypes();
    }, []);

    // Валидации
    const validatePhone = (_: any, value: string) => {
        const phoneRegex = /^\+7\d{10}$/;
        if (!value) {
            return Promise.reject(new Error("Обязательное поле"));
        }
        if (!phoneRegex.test(value)) {
            return Promise.reject(new Error("Формат: +7XXXXXXXXXX"));
        }
        return Promise.resolve();
    };

    const validateAddress = (_: any, value: string) => {
        if (!value) {
            return Promise.reject(new Error("Обязательное поле"));
        }
        if (value.length > 80) {
            return Promise.reject(new Error("Максимум 80 символов"));
        }
        return Promise.resolve();
    };

    const validateDimensions = (value: number | null) => {
        if (!value || value < 1 || value > 500) {
            return Promise.reject(new Error("Должно быть от 1 до 500 см"));
        }
        return Promise.resolve();
    };

    const validateWeight = (value: number | null) => {
        if (!value || value < 1 || value > 1000) {
            return Promise.reject(new Error("Должно быть от 1 до 1000 кг"));
        }
        return Promise.resolve();
    };

    // Обработчики для грузов
    const addCargoItem = () => {
        const newKey =
            cargoItems.length > 0
                ? Math.max(...cargoItems.map((item) => item.key)) + 1
                : 1;
        setCargoItems([
            ...cargoItems,
            {
                key: newKey,
                length: 10,
                height: 10,
                width: 10,
                weight: 1,
                cargoType: 1,
                description: "",
                worth: 0,
            },
        ]);
    };

    const removeCargoItem = (key: number) => {
        if (cargoItems.length <= 1) {
            message.warning("Должен остаться хотя бы один груз");
            return;
        }
        setCargoItems(cargoItems.filter((item) => item.key !== key));
    };

    const updateCargoItem = (
        key: number,
        field: keyof CargoFormItem,
        value: any
    ) => {
        setCargoItems(
            cargoItems.map((item) =>
                item.key === key ? { ...item, [field]: value } : item
            )
        );
    };

    // Проверка суммы габаритов
    const validateTotalDimensions = (items: CargoFormItem[]): boolean => {
        return items.every((item) => {
            const total = item.length + item.width + item.height;
            return total <= 1000;
        });
    };

    // Отправка формы
    const handleSubmit = async (values: any) => {
        if (!user?.id) {
            message.error("Пользователь не авторизован");
            return;
        }

        if (cargoItems.length === 0) {
            message.error("Добавьте хотя бы один груз");
            return;
        }

        // Проверка суммы габаритов
        if (!validateTotalDimensions(cargoItems)) {
            message.error(
                "Сумма габаритов (Д+Ш+В) не должна превышать 1000 см для каждого груза"
            );
            return;
        }

        setLoading(true);

        try {
            // 1. Создаем получателя
            const recipientData: Recipient = {
                firstname: values.recipientFirstName,
                secondname: values.recipientLastName,
                thirdname: values.recipientMiddleName || "",
                phone: values.recipientPhone,
                email: values.recipientEmail,
            };

            const recipientResponse = await cargoRequestsApi.createRecipient(
                recipientData
            );

            // 2. Создаем заявку
            const requestData = {
                consignerId: parseInt(user.id),
                recipientId: recipientResponse.id,
                fromStation: {
                    address: values.fromAddress,
                    coords: {
                        lat: 55.7558, // Моковые координаты
                        lon: 37.6173,
                    },
                },
                toStation: {
                    address: values.toAddress,
                    coords: {
                        lat: 59.9343, // Моковые координаты
                        lon: 30.3351,
                    },
                },
                deadline: dayjs(values.deadline).format("YYYY-MM-DDTHH:mm:ssZ"),
                maxPrice: values.maxPrice.toString(),
            };

            const requestResponse = await cargoRequestsApi.createCargoRequest(
                requestData
            );

            // 3. Создаем грузы
            const cargoData: CargoItem[] = cargoItems.map((item) => ({
                length: item.length,
                height: item.height,
                width: item.width,
                weight: item.weight,
                cargoType: item.cargoType,
                description: item.description || "",
                worth: item.worth,
                cargoRequestId: requestResponse.id,
            }));

            await cargoRequestsApi.createCargo(cargoData);

            message.success("Заявка успешно создана!");

            // Редирект на главную страницу
            navigate("/shipper/main");
        } catch (error: any) {
            console.error("Error creating request:", error);
            message.error("Ошибка при создании заявки");
        } finally {
            setLoading(false);
        }
    };

    if (!user || user.role !== "ROLE_CONSIGNER") {
        return (
            <div style={{ padding: "20px" }}>
                <Alert
                    message="Доступ запрещен"
                    description="Эта страница доступна только грузоотправителям"
                    type="error"
                    showIcon
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
            <Title level={2}>Создание заявки на перевозку</Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    maxPrice: 1000,
                }}
            >
                {/* Адреса */}
                <Card title="Адреса" style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fromAddress"
                                label="Адрес отправления"
                                rules={[{ validator: validateAddress }]}
                            >
                                <Input placeholder="Введите адрес отправления" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="toAddress"
                                label="Адрес доставки"
                                rules={[{ validator: validateAddress }]}
                            >
                                <Input placeholder="Введите адрес доставки" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Получатель */}
                <Card
                    title="Информация о получателе"
                    style={{ marginBottom: 24 }}
                >
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="recipientLastName"
                                label="Фамилия"
                                rules={[
                                    {
                                        required: true,
                                        message: "Обязательное поле",
                                    },
                                    {
                                        max: 40,
                                        message: "Максимум 40 символов",
                                    },
                                    {
                                        pattern: /^[а-яА-ЯёЁ\s\-]+$/,
                                        message:
                                            "Только кириллица, пробелы и дефисы",
                                    },
                                ]}
                            >
                                <Input placeholder="Фамилия" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="recipientFirstName"
                                label="Имя"
                                rules={[
                                    {
                                        required: true,
                                        message: "Обязательное поле",
                                    },
                                    {
                                        max: 30,
                                        message: "Максимум 30 символов",
                                    },
                                    {
                                        pattern: /^[а-яА-ЯёЁ\s\-]+$/,
                                        message:
                                            "Только кириллица, пробелы и дефисы",
                                    },
                                ]}
                            >
                                <Input placeholder="Имя" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="recipientMiddleName"
                                label="Отчество"
                                rules={[
                                    {
                                        max: 40,
                                        message: "Максимум 40 символов",
                                    },
                                    {
                                        pattern: /^[а-яА-ЯёЁ\s\-]*$/,
                                        message:
                                            "Только кириллица, пробелы и дефисы",
                                    },
                                ]}
                            >
                                <Input placeholder="Отчество" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="recipientEmail"
                                label="Email"
                                rules={[
                                    {
                                        required: true,
                                        message: "Обязательное поле",
                                    },
                                    {
                                        type: "email",
                                        message: "Неверный формат email",
                                    },
                                    {
                                        max: 128,
                                        message: "Максимум 128 символов",
                                    },
                                ]}
                            >
                                <Input placeholder="email@example.com" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="recipientPhone"
                                label="Телефон"
                                rules={[{ validator: validatePhone }]}
                            >
                                <Input placeholder="+7XXXXXXXXXX" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Параметры заявки */}
                <Card title="Параметры заявки" style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="deadline"
                                label="Дедлайн доставки"
                                rules={[
                                    {
                                        required: true,
                                        message: "Обязательное поле",
                                    },
                                ]}
                            >
                                <DatePicker
                                    style={{ width: "100%" }}
                                    disabledDate={(current) => {
                                        return (
                                            current &&
                                            (current < dayjs().startOf("day") ||
                                                current >
                                                    dayjs().add(2, "month"))
                                        );
                                    }}
                                    placeholder="Выберите дату"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="maxPrice"
                                label="Максимальная стоимость (руб)"
                                rules={[
                                    {
                                        required: true,
                                        message: "Обязательное поле",
                                    },
                                    {
                                        type: "number",
                                        min: 0,
                                        max: 1000000,
                                        message: "От 0 до 1 000 000 руб",
                                    },
                                ]}
                            >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    min={0}
                                    max={1000000}
                                    formatter={(value) =>
                                        `${value}`.replace(
                                            /\B(?=(\d{3})+(?!\d))/g,
                                            " "
                                        )
                                    }
                                    parser={(value) => {
                                        const num =
                                            parseInt(
                                                value!.replace(/\s/g, "")
                                            ) || 0;
                                        return Math.max(
                                            0,
                                            Math.min(1000000, num)
                                        ) as 0 | 1000000;
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Card>

                {/* Грузы */}
                <Card title="Информация о грузах" style={{ marginBottom: 24 }}>
                    {cargoItems.map((item, index) => (
                        <div key={item.key}>
                            {index > 0 && <Divider />}

                            <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                                size="middle"
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Title level={4} style={{ margin: 0 }}>
                                        Груз #{index + 1}
                                    </Title>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() =>
                                            removeCargoItem(item.key)
                                        }
                                        disabled={cargoItems.length <= 1}
                                    >
                                        Удалить
                                    </Button>
                                </div>

                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Form.Item label="Длина (см)" required>
                                            <InputNumber
                                                value={item.length}
                                                onChange={(value) =>
                                                    updateCargoItem(
                                                        item.key,
                                                        "length",
                                                        value || 0
                                                    )
                                                }
                                                min={1}
                                                max={500}
                                                style={{ width: "100%" }}
                                                placeholder="Длина"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item label="Ширина (см)" required>
                                            <InputNumber
                                                value={item.width}
                                                onChange={(value) =>
                                                    updateCargoItem(
                                                        item.key,
                                                        "width",
                                                        value || 0
                                                    )
                                                }
                                                min={1}
                                                max={500}
                                                style={{ width: "100%" }}
                                                placeholder="Ширина"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item label="Высота (см)" required>
                                            <InputNumber
                                                value={item.height}
                                                onChange={(value) =>
                                                    updateCargoItem(
                                                        item.key,
                                                        "height",
                                                        value || 0
                                                    )
                                                }
                                                min={1}
                                                max={500}
                                                style={{ width: "100%" }}
                                                placeholder="Высота"
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item label="Вес (кг)" required>
                                            <InputNumber
                                                value={item.weight}
                                                onChange={(value) =>
                                                    updateCargoItem(
                                                        item.key,
                                                        "weight",
                                                        value || 0
                                                    )
                                                }
                                                min={1}
                                                max={1000}
                                                style={{ width: "100%" }}
                                                placeholder="Вес"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Тип груза">
                                            <Select
                                                value={item.cargoType}
                                                onChange={(value) =>
                                                    updateCargoItem(
                                                        item.key,
                                                        "cargoType",
                                                        value
                                                    )
                                                }
                                                style={{ width: "100%" }}
                                            >
                                                {cargoTypes.map((type) => (
                                                    <Option
                                                        key={type.id}
                                                        value={type.id}
                                                    >
                                                        {type.type}{" "}
                                                        {type.fragile
                                                            ? "(Хрупкий)"
                                                            : ""}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Объявленная ценность (руб)">
                                            <InputNumber
                                                value={item.worth}
                                                onChange={(value) =>
                                                    updateCargoItem(
                                                        item.key,
                                                        "worth",
                                                        value || 0
                                                    )
                                                }
                                                min={0}
                                                max={1000000}
                                                style={{ width: "100%" }}
                                                formatter={(value) =>
                                                    `${value}`.replace(
                                                        /\B(?=(\d{3})+(?!\d))/g,
                                                        " "
                                                    )
                                                }
                                                parser={(value) =>
                                                    parseInt(
                                                        value!.replace(
                                                            /\s/g,
                                                            ""
                                                        )
                                                    ) || 0
                                                }
                                                placeholder="Ценность"
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item label="Описание груза">
                                    <Input.TextArea
                                        value={item.description}
                                        onChange={(e) =>
                                            updateCargoItem(
                                                item.key,
                                                "description",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Описание груза"
                                        maxLength={500}
                                        rows={3}
                                        showCount
                                    />
                                </Form.Item>
                            </Space>
                        </div>
                    ))}

                    <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={addCargoItem}
                        style={{ width: "100%" }}
                    >
                        Добавить еще груз
                    </Button>
                </Card>

                {/* Кнопки отправки */}
                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        size="large"
                    >
                        Создать заявку
                    </Button>
                    <Button
                        onClick={() => navigate("/shipper/main")}
                        size="large"
                    >
                        Отмена
                    </Button>
                </Space>
            </Form>
        </div>
    );
};

export default ShipperCreateRequestPage;
