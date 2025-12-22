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
    Alert,
    Row,
    Col,
    message,
    Select,
    Layout,
} from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { cargoRequestsApi } from "../api/cargoRequests";
import { recipientsApi } from "../api/recipients";
import type {
    CargoItem,
    RecipientData,
    CargoType,
    AddressSuggestion,
    AddressData,
    Station,
    CreateCargoRequestData,
    RequestCreationState,
    PartialRequestData,
} from "../types/cargo";
import dayjs from "dayjs";
import { Content } from "antd/es/layout/layout";
import HybridAddressInput from "../components/HybridAddressInput";
import "./ShipperCreateRequestPage.css";
import {
    validateEmail,
    validateName,
    validatePhone,
} from "../utils/validators";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface CargoFormItem extends Omit<CargoItem, "cargoType"> {
    cargoType: number;
    key: number;
}

const fetchAddressSuggestions = async (
    query: string
): Promise<AddressSuggestion[]> => {
    if (!query || query.length < 3) return [];

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                query
            )}&limit=5&countrycodes=ru&addressdetails=1`
        );
        const data = await response.json();
        return data.map((item: any) => ({
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
        }));
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
    }
};

const ShipperCreateRequestPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [cargoTypes, setCargoTypes] = useState<CargoType[]>([]);

    // Состояние создания заявки
    const [creationState, setCreationState] = useState<RequestCreationState>({
        step: "initial",
        errors: {},
        formData: {
            recipient: null,
            request: null,
            cargo: null,
        },
        receiveCode: null,
    });

    const [cargoItem, setCargoItem] = useState<CargoFormItem>({
        key: 1,
        length: 10,
        height: 10,
        width: 10,
        weight: 1,
        cargoType: 1,
        worth: 0,
    });

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

    // Загружаем состояние из localStorage при монтировании
    useEffect(() => {
        const savedState = localStorage.getItem("pending_request");
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                setCreationState(parsed);

                // Показываем предупреждение
                message.warning(
                    "Обнаружена незавершенная заявка. Продолжить создание?",
                    5
                );
            } catch (e) {
                console.error("Ошибка загрузки состояния:", e);
            }
        }
    }, []);

    // Сохраняем состояние в localStorage
    useEffect(() => {
        if (creationState.step !== "initial") {
            localStorage.setItem(
                "pending_request",
                JSON.stringify(creationState)
            );
        } else {
            localStorage.removeItem("pending_request");
        }
    }, [creationState]);

    // Функция для обновления одного поля груза
    const updateCargoField = (field: keyof CargoFormItem, value: any) => {
        setCargoItem((prev) => ({ ...prev, [field]: value }));
    };

    // Валидация суммы габаритов для одного груза
    const validateTotalDimensions = (item: CargoFormItem): boolean => {
        const total = item.length + item.width + item.height;
        return total <= 1000;
    };

    // Основная функция создания
    const handleSubmit = async (values: any) => {
        if (!user?.id) {
            message.error("Пользователь не авторизован");
            return;
        }

        // Проверка суммы габаритов
        if (!validateTotalDimensions(cargoItem)) {
            message.error(
                "Сумма габаритов (Д+Ш+В) не должна превышать 1000 см для каждого груза"
            );
            return;
        }

        setLoading(true);

        try {
            // Собираем все данные
            const partialData: PartialRequestData = {
                recipientData: {
                    firstname: values.recipientFirstName,
                    secondname: values.recipientLastName,
                    thirdname: values.recipientMiddleName || "",
                    phone: values.recipientPhone,
                    email: values.recipientEmail,
                },
                requestData: {
                    consignerId: Number(user.id),
                    fromStation: await getStationFromAddress(
                        values.fromAddress
                    ),
                    toStation: await getStationFromAddress(values.toAddress),
                    deadline: values.deadline.format("YYYY-MM-DDTHH:mm:ssZ"),
                    maxPrice: values.maxPrice.toString(),
                },
                cargoItems: [
                    {
                        length: cargoItem.length,
                        height: cargoItem.height,
                        width: cargoItem.width,
                        weight: cargoItem.weight,
                        cargoType: cargoItem.cargoType,
                        worth: cargoItem.worth,
                        cargoRequestId: "",
                    },
                ],
            };

            // Сохраняем данные в state
            setCreationState((prev) => ({
                ...prev,
                formData: {
                    recipient: partialData.recipientData,
                    request: { ...partialData.requestData, recipientId: 0 }, // временно
                    cargo: partialData.cargoItems,
                },
            }));

            await executeCreationFlow(partialData, {
                ...creationState,
                formData: {
                    recipient: partialData.recipientData,
                    request: { ...partialData.requestData, recipientId: 0 },
                    cargo: partialData.cargoItems,
                },
            });
        } catch (error: any) {
            console.error("Error creating request:", error);
            message.error(error.message || "Ошибка при создании заявки");
        } finally {
            setLoading(false);
        }
    };

    const executeCreationFlow = async (
        data: PartialRequestData,
        state: RequestCreationState
    ) => {
        const { recipientData, requestData, cargoItems } = data;

        try {
            if (
                creationState.step === "initial" ||
                !creationState.recipientId
            ) {
                message.loading("Создание получателя...", 0);

                try {
                    const recipientResponse =
                        await recipientsApi.createRecipient(recipientData);

                    const newStateAfterRecipient = {
                        ...state,
                        step: "recipient_created" as const,
                        recipientId: recipientResponse.id,
                        errors: { ...state.errors, recipient: undefined },
                    };

                    setCreationState(newStateAfterRecipient);
                    state = newStateAfterRecipient;

                    message.destroy();
                    message.success("Получатель создан");
                } catch (error: any) {
                    setCreationState((prev) => ({
                        ...prev,
                        errors: { ...prev.errors, recipient: error.message },
                    }));
                    throw new Error(
                        `Ошибка создания получателя: ${error.message}`
                    );
                }
            }

            // Создание заявки (если еще не создана)
            if (state.step === "recipient_created" || !state.requestId) {
                message.loading("Создание заявки...", 0);

                try {
                    // const completeRequestData: CreateCargoRequestData = {
                    //     ...requestData,
                    //     recipientId: creationState.recipientId!,
                    // };
                    const completeRequestData: CreateCargoRequestData = {
                        consignerId: requestData.consignerId,
                        recipientId: state.recipientId!,

                        fromStation: requestData.fromStation,
                        toStation: requestData.toStation,
                        deadline: requestData.deadline,
                        maxPrice: requestData.maxPrice,
                    };

                    console.log(
                        "Sending request with recipientId:",
                        creationState.recipientId
                    );
                    console.log("Full request data:", completeRequestData);

                    const requestResponse =
                        await cargoRequestsApi.createCargoRequest(
                            completeRequestData
                        );

                    const newStateAfterRequest = {
                        ...state,
                        step: "request_created" as const,
                        requestId: requestResponse.id,
                        errors: { ...state.errors, request: undefined },
                        receiveCode: requestResponse.receiveCode,
                    };

                    setCreationState(newStateAfterRequest);
                    state = newStateAfterRequest;

                    message.destroy();
                    message.success("Заявка создана");
                } catch (error: any) {
                    setCreationState((prev) => ({
                        ...prev,
                        errors: { ...prev.errors, request: error.message },
                    }));
                    throw new Error(`Ошибка создания заявки: ${error.message}`);
                }
            }

            // Создание груза (если еще не создан)
            if (state.step === "request_created") {
                message.loading("Создание груза...", 0);

                try {
                    const cargoData = cargoItems.map((item) => ({
                        ...item,
                        cargoRequestId: state.requestId!,
                    }));
                    console.log("Данные груза, отправка на сервер:", cargoData);

                    const cargoResponse = await cargoRequestsApi.createCargo(
                        cargoData
                    );

                    message.destroy();
                    message.success("Груз создан");

                    // Очищаем состояние
                    localStorage.removeItem("pending_request");

                    navigate(`/shipper/request/success/${state.receiveCode}`);
                } catch (error: any) {
                    setCreationState((prev) => ({
                        ...prev,
                        errors: { ...prev.errors, cargo: error.message },
                    }));
                    throw new Error(`Ошибка создания груза: ${error.message}`);
                }
            }
        } finally {
            message.destroy();
        }
    };

    // Функция для продолжения создания
    const continueCreation = async () => {
        if (!user?.id) {
            message.error("Пользователь не авторизован");
            return;
        }

        if (
            !creationState.formData.recipient ||
            !creationState.formData.request
        ) {
            message.error("Нет данных для продолжения");
            return;
        }

        setLoading(true);
        try {
            const data: PartialRequestData = {
                recipientData: creationState.formData.recipient,
                requestData: {
                    consignerId: parseInt(user.id),
                    fromStation: creationState.formData.request.fromStation,
                    toStation: creationState.formData.request.toStation,
                    deadline: creationState.formData.request.deadline,
                    maxPrice: creationState.formData.request.maxPrice,
                },
                cargoItems: creationState.formData.cargo || [],
            };

            // await executeCreationFlow(data);
            await executeCreationFlow(data, creationState);
        } catch (error: any) {
            message.error(error.message || "Ошибка продолжения");
        } finally {
            setLoading(false);
        }
    };

    // Функция для сброса состояния
    const resetCreation = () => {
        setCreationState({
            step: "initial",
            errors: {},
            formData: {
                recipient: null,
                request: null,
                cargo: null,
            },
            receiveCode: null,
        });
        localStorage.removeItem("pending_request");
        form.resetFields();
        message.info("Создание заявки сброшено");
    };

    // Вспомогательная функция
    const getStationFromAddress = async (
        addressData: AddressData
    ): Promise<Station> => {
        if (!addressData?.isValid || !addressData.coords) {
            throw new Error("Неверный адрес");
        }

        return {
            address: addressData.address,
            coords: addressData.coords,
        };
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

    const CARGO_TYPE_MAP: Record<string, string> = {
        type1: "Обычный",
        fragile: "Хрупкий",
    };

    return (
        <Layout style={{ background: "#212D3B" }}>
            <Content
                style={{
                    padding: "24px",
                    maxWidth: 1200,
                    margin: "0 auto",
                    background: "#212D3B",
                }}
            >
                <Title level={2}>Создание заявки на перевозку</Title>
                {/* {creationState.step !== "initial" && (
                    <Alert
                        message={`Прогресс создания: ${getStepText(
                            creationState.step
                        )}`}
                        description={
                            <div>
                                {creationState.recipientId && (
                                    <div>
                                        ✅ Получатель ID:{" "}
                                        {creationState.recipientId}
                                    </div>
                                )}
                                {creationState.requestId && (
                                    <div>
                                        ✅ Заявка ID: {creationState.requestId}
                                    </div>
                                )}
                                {creationState.errors.recipient && (
                                    <div style={{ color: "red" }}>
                                        ❌ Ошибка получателя:{" "}
                                        {creationState.errors.recipient}
                                    </div>
                                )}
                                {creationState.errors.request && (
                                    <div style={{ color: "red" }}>
                                        ❌ Ошибка заявки:{" "}
                                        {creationState.errors.request}
                                    </div>
                                )}
                                {creationState.errors.cargo && (
                                    <div style={{ color: "red" }}>
                                        ❌ Ошибка груза:{" "}
                                        {creationState.errors.cargo}
                                    </div>
                                )}
                                <Space style={{ marginTop: 10 }}>
                                    <Button
                                        onClick={continueCreation}
                                        size="small"
                                    >
                                        Продолжить создание
                                    </Button>
                                    <Button
                                        onClick={resetCreation}
                                        size="small"
                                        danger
                                    >
                                        Начать заново
                                    </Button>
                                </Space>
                            </div>
                        }
                        type="info"
                        style={{ marginBottom: 24 }}
                    />
                )} */}

                <Form
                    form={form}
                    layout="vertical"
                    style={{ color: "#fff" }}
                    onFinish={handleSubmit}
                    initialValues={{
                        maxPrice: 1000,
                    }}
                >
                    {/* карточка 1 */}
                    <Card
                        style={{
                            backgroundColor: "#293645",
                            borderRadius: 32,
                            marginBottom: 24,
                            border: "none",
                        }}
                        bodyStyle={{
                            backgroundColor: "#293645",
                            borderRadius: 32,
                        }}
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
                                            max: 100,
                                            message: "Максимум 100 символов",
                                        },
                                        {
                                            validator: validateName,
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
                                            max: 100,
                                            message: "Максимум 100 символов",
                                        },
                                        {
                                            validator: validateName,
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
                                            max: 100,
                                            message: "Максимум 100 символов",
                                        },
                                        {
                                            validator: validateName,
                                        },
                                    ]}
                                >
                                    <Input placeholder="Отчество" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="recipientEmail"
                                    label="Email"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Обязательное поле",
                                        },
                                        {
                                            validator: validateEmail,
                                        },
                                        {
                                            max: 100,
                                            message: "Максимум 100 символов",
                                        },
                                    ]}
                                >
                                    <Input placeholder="email@example.com" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="recipientPhone"
                                    label="Номер телефона получателя"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Обязательное поле",
                                        },
                                        {
                                            validator: validatePhone,
                                        },
                                    ]}
                                >
                                    <Input placeholder="+7XXXXXXXXXX" />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
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
                                                (current <
                                                    dayjs().startOf("day") ||
                                                    current >
                                                        dayjs().add(2, "month"))
                                            );
                                        }}
                                        placeholder="Выберите дату"
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label="Адрес отправления"
                                    name="fromAddress"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Укажите адрес",
                                        },
                                    ]}
                                    getValueFromEvent={(v) => v}
                                >
                                    <HybridAddressInput
                                        placeholder="Введите адрес или выберите на карте"
                                        fetchSuggestions={
                                            fetchAddressSuggestions
                                        }
                                        onChange={(v) =>
                                            form.setFieldValue("fromAddress", v)
                                        }
                                        value={form.getFieldValue(
                                            "fromAddress"
                                        )}
                                    />
                                </Form.Item>
                            </Col>

                            <Col span={8}>
                                <Form.Item
                                    label="Адрес доставки"
                                    name="toAddress"
                                    rules={[
                                        {
                                            required: true,
                                            message: "Укажите адрес",
                                        },
                                    ]}
                                    getValueFromEvent={(v) => v}
                                >
                                    <HybridAddressInput
                                        placeholder="Введите адрес или выберите на карте"
                                        fetchSuggestions={
                                            fetchAddressSuggestions
                                        }
                                        onChange={(v) =>
                                            form.setFieldValue("toAddress", v)
                                        }
                                        value={form.getFieldValue("toAddress")}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>

                    {/* Карточка 2 */}
                    <Card
                        style={{
                            backgroundColor: "#293645",
                            borderRadius: 32,
                            marginBottom: 24,
                            border: "none",
                        }}
                        bodyStyle={{
                            backgroundColor: "#293645",
                            borderRadius: 32,
                        }}
                    >
                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="middle"
                        >
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item
                                        label="Габариты (Д × Ш × В), см"
                                        required
                                    >
                                        <Row gutter={12}>
                                            <Col span={8}>
                                                <InputNumber
                                                    value={cargoItem.length}
                                                    onChange={(value) =>
                                                        updateCargoField(
                                                            "length",
                                                            value || 0
                                                        )
                                                    }
                                                    min={1}
                                                    max={500}
                                                    placeholder="Длина"
                                                    style={{ width: "100%" }}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <InputNumber
                                                    value={cargoItem.width}
                                                    onChange={(value) =>
                                                        updateCargoField(
                                                            "width",
                                                            value || 0
                                                        )
                                                    }
                                                    min={1}
                                                    max={500}
                                                    placeholder="Ширина"
                                                    style={{ width: "100%" }}
                                                />
                                            </Col>
                                            <Col span={8}>
                                                <InputNumber
                                                    value={cargoItem.height}
                                                    onChange={(value) =>
                                                        updateCargoField(
                                                            "height",
                                                            value || 0
                                                        )
                                                    }
                                                    min={1}
                                                    max={500}
                                                    placeholder="Высота"
                                                    style={{ width: "100%" }}
                                                />
                                            </Col>
                                        </Row>
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item
                                        name="maxPrice"
                                        label="Вознаграждение ₽"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Обязательное поле",
                                            },
                                            {
                                                type: "number",
                                                min: 0,
                                                max: 1000000,
                                                message:
                                                    "От 0 до 1 000 000 руб",
                                            },
                                        ]}
                                    >
                                        <InputNumber
                                            value={cargoItem.worth}
                                            onChange={(value) =>
                                                updateCargoField(
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
                                                    value!.replace(/\s/g, "")
                                                ) || 0
                                            }
                                            placeholder="Ценность"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={8}>
                                    <Form.Item label="Вес (кг)" required>
                                        <InputNumber
                                            value={cargoItem.weight}
                                            onChange={(value) =>
                                                updateCargoField(
                                                    "weight",
                                                    value || 0
                                                )
                                            }
                                            min={1}
                                            max={100000}
                                            style={{ width: "100%" }}
                                            placeholder="Вес"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item label="Тип груза">
                                <Select
                                    value={cargoItem.cargoType}
                                    onChange={(value) =>
                                        updateCargoField("cargoType", value)
                                    }
                                    style={{ width: "100%" }}
                                >
                                    {/* {cargoTypes.map((type) => (
                                        <Option key={type.id} value={type.id}>
                                            {type.type}{" "}
                                        </Option>
                                    ))} */}
                                    {cargoTypes.map((type) => {
                                        const baseName =
                                            CARGO_TYPE_MAP[type.type] ||
                                            type.type;
                                        const displayName = baseName;

                                        return (
                                            <Option
                                                key={type.id}
                                                value={type.id}
                                            >
                                                {displayName}
                                            </Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>
                        </Space>
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
                            onClick={() => navigate("/shipper/home")}
                            size="large"
                        >
                            Отмена
                        </Button>
                    </Space>
                </Form>
            </Content>
        </Layout>
    );
};

export default ShipperCreateRequestPage;

// Вспомогательная функция
const getStepText = (step: RequestCreationState["step"]): string => {
    switch (step) {
        case "initial":
            return "Начало";
        case "recipient_created":
            return "Получатель создан";
        case "request_created":
            return "Заявка создана";
        case "complete":
            return "Завершено";
        default:
            return "Неизвестно";
    }
};
