// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from "react";
import { AuthCard } from "../components/AuthCard";
import {
    Form,
    Input,
    Button,
    Alert,
    Space,
    Layout,
    Flex,
    Radio,
    Typography,
    Checkbox,
    DatePicker,
} from "antd";
import { useNavigate, Link } from "react-router-dom";
import { AuthTabs } from "../components/AuthTabs";
import { useAuth } from "../context/AuthContext";
import { doRegister, checkEmail, doLogin } from "../api/auth";
import dayjs from "dayjs";

const { Content } = Layout;
const { Text } = Typography;

// Определяем типы для данных формы
interface RegisterFormData {
    email: string;
    role: string;
    password: string;
    confirmPassword: string;
    code?: string;
}

interface UserProfileData {
    firstName: string;
    lastName: string;
    middleName?: string;
    phone?: string;
    birthDate: any;
    agree: boolean;
}

export default function RegisterPage(): React.JSX.Element {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [currentStep, setCurrentStep] = useState(0); // 0 - регистрация, 1 - профиль
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    // const [emailVerified, setEmailVerified] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [registerForm] = Form.useForm();
    const [profileForm] = Form.useForm();

    const onTabChange = (key: string) => navigate(key);

    // Шаги для отображения прогресса
    const steps = [
        {
            title: "Регистрация",
            description: "Введите основные данные",
        },
        {
            title: "Профиль",
            description: "Заполните личную информацию",
        },
    ];

    // Обработчик верификации email
    const handleVerifyEmail = async () => {
        const email = registerForm.getFieldValue("email");
        if (!email) {
            setServerError("Введите email для подтверждения");
            return;
        }

        setServerError(null);
        setLoading(true);
        try {
            const res = await checkEmail(email);
            if (!res.ok) setServerError(res.message ?? "Ошибка отправки кода");
            else {
                setSuccessMessage("Код подтверждения отправлен на email!");
                setCodeSent(true);
                sessionStorage.setItem("registration_in_progress", "true");
                sessionStorage.setItem("registration_email", email);
            }
        } catch {
            setServerError("Сервер недоступен");
        } finally {
            setLoading(false);
        }
    };

    // // Обработчик проверки кода
    // const handleCodeSubmit = async () => {
    //     const code = registerForm.getFieldValue("code");
    //     const email = registerForm.getFieldValue("email");

    //     if (!code || code.length !== 12) {
    //         setServerError("Код должен содержать 12 цифр");
    //         return;
    //     }

    //     setLoading(true);
    //     setServerError(null);

    //     try {
    //         // Здесь должна быть проверка кода на сервере
    //         // Пока имитируем успешную проверку
    //         await new Promise((resolve) => setTimeout(resolve, 1000));

    //         // Если код верный
    //         setEmailVerified(true);
    //         setSuccessMessage("Email подтвержден! Заполните остальные данные.");
    //         sessionStorage.setItem("registration_in_progress", "true");
    //         sessionStorage.setItem("registration_email", email);
    //         sessionStorage.setItem(
    //             "registration_role",
    //             registerForm.getFieldValue("role")
    //         );
    //     } catch {
    //         setServerError("Неверный код подтверждения");
    //         registerForm.setFieldValue("code", ""); // Очищаем поле при ошибке
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // Обработчик первой формы (регистрация)
    const onRegisterFinish = async (values: RegisterFormData) => {
        console.log("Регистрационные данные:", values);
        console.log("Роль из формы:", values.role);
        // if (!emailVerified) {
        //     setServerError("Сначала подтвердите email");
        //     return;
        // }

        setServerError(null);
        setLoading(true);
        try {
            // Сохраняем ВСЕ данные регистрации, а не только email и role
            const registerData = registerForm.getFieldsValue();
            sessionStorage.setItem("registration_in_progress", "true");
            sessionStorage.setItem("registration_email", values.email);
            sessionStorage.setItem("registration_role", values.role);
            sessionStorage.setItem("registration_password", values.password);

            setCurrentStep(1); // Переходим к шагу профиля
            setSuccessMessage(
                "Регистрационные данные сохранены. Заполните профиль."
            );
        } catch {
            setServerError("Ошибка сохранения данных");
        } finally {
            setLoading(false);
        }
    };
    const getValidRole = (role: string): "ROLE_CONSIGNER" | "ROLE_CARRIER" => {
        if (role === "ROLE_CONSIGNER" || role === "ROLE_CARRIER") {
            return role;
        }
        console.log("stupid role " + role);
        // Значение по умолчанию или ошибка
        throw new Error("Invalid role");
        // или: return "ROLE_CONSIGNER"; // значение по умолчанию
    };

    // Обработчик второй формы (профиль)
    const onProfileFinish = async (values: UserProfileData) => {
        if (!values.agree) {
            setServerError(
                "Вы должны согласиться на обработку персональных данных"
            );
            return;
        }

        setServerError(null);
        setLoading(true);

        try {
            // Получаем данные из sessionStorage
            const registerEmail = sessionStorage.getItem("registration_email");
            const registerPassword = sessionStorage.getItem(
                "registration_password"
            );
            const registerRole = sessionStorage.getItem("registration_role");
            console.log("role = " + registerRole);

            // Проверяем что все обязательные поля есть
            if (!registerEmail || !registerPassword || !registerRole) {
                setServerError("Данные регистрации потеряны. Начните заново.");
                return;
            }

            // Формируем данные согласно API
            const fullData = {
                email: registerEmail,
                password: registerPassword,
                firstName: values.firstName,
                secondName: values.lastName,
                thirdName: values.middleName || "",
                phone: values.phone || "",
                role: registerRole as "ROLE_CONSIGNER" | "ROLE_CARRIER",
                birthdate: values.birthDate
                    ? values.birthDate.format("YYYY-MM-DD")
                    : "",
            };
            console.log("Отправляем данные регистрации:", fullData);

            const res = await doRegister(fullData);
            if (!res.ok) {
                setServerError(res.message ?? "Ошибка регистрации");
                return;
            }

            console.log("Регистрация успешна, логинимся...");

            // Редирект на логин
            let redirectTo = "/login";

            console.log("Редирект на:", redirectTo);
            navigate(redirectTo, { replace: true });
        } catch (error) {
            console.error("Ошибка в onProfileFinish:", error);
            setServerError("Сервер недоступен");
        } finally {
            setLoading(false);
        }
    };

    // Возврат к предыдущему шагу
    const handleBack = () => {
        setCurrentStep(0);
        setServerError(null);
        setSuccessMessage(null);
    };

    return (
        <Layout style={{ backgroundColor: "#212D3B" }}>
            <Content>
                <Flex justify="center" align="center">
                    <AuthCard>
                        <AuthTabs
                            activeKey="/register"
                            onTabChange={onTabChange}
                        />

                        <Space
                            direction="vertical"
                            style={{ width: "100%" }}
                            size="middle"
                        >
                            {serverError && (
                                <Alert
                                    type="error"
                                    message={serverError}
                                    showIcon
                                />
                            )}
                            {successMessage && (
                                <Alert
                                    type="success"
                                    message={successMessage}
                                    showIcon
                                />
                            )}

                            {/* Первая форма - регистрация */}
                            {currentStep === 0 && (
                                <Form
                                    form={registerForm}
                                    layout="vertical"
                                    onFinish={onRegisterFinish}
                                    requiredMark={false}
                                    initialValues={{ role: "ROLE_CONSIGNER" }}
                                >
                                    <Form.Item
                                        // label="Email"
                                        name="email"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Введите email",
                                            },
                                            {
                                                type: "email",
                                                message:
                                                    "Введите корректный email",
                                            },
                                            {
                                                max: 128,
                                                message:
                                                    "Максимум 128 символов",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Введите email"
                                            size="large"
                                            disabled={codeSent}
                                        />
                                    </Form.Item>

                                    <Form.Item name="role">
                                        <Space
                                            direction="vertical"
                                            style={{
                                                width: "100%",
                                                color: "white",
                                            }}
                                        >
                                            <Radio.Group>
                                                <Radio
                                                    value="ROLE_CONSIGNER"
                                                    style={{ color: "white" }}
                                                >
                                                    Грузоотправитель
                                                </Radio>
                                                <Radio
                                                    value="ROLE_CARRIER"
                                                    style={{ color: "white" }}
                                                >
                                                    Грузоперевозчик
                                                </Radio>
                                            </Radio.Group>
                                            <Typography.Text type="warning">
                                                Роль нельзя будет изменить. Если
                                                вы захотите использовать
                                                приложение в другой роли, то вам
                                                понадобится зарегистрировать
                                                аккаунт на новую почту.
                                            </Typography.Text>
                                        </Space>
                                    </Form.Item>

                                    <Form.Item
                                        name="password"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Введите пароль",
                                            },
                                            {
                                                min: 8,
                                                message:
                                                    "Пароль должен содержать минимум 8 символов",
                                            },
                                            {
                                                max: 64,
                                                message: "Максимум 64 символа",
                                            },
                                        ]}
                                    >
                                        <Input.Password
                                            placeholder="Пароль"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="confirmPassword"
                                        dependencies={["password"]}
                                        rules={[
                                            {
                                                required: true,
                                                message: "Подтвердите пароль",
                                            },
                                            {
                                                min: 8,
                                                message:
                                                    "Пароль должен содержать минимум 8 символов",
                                            },
                                            {
                                                max: 64,
                                                message: "Максимум 64 символа",
                                            },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (
                                                        !value ||
                                                        getFieldValue(
                                                            "password"
                                                        ) === value
                                                    )
                                                        return Promise.resolve();
                                                    return Promise.reject(
                                                        new Error(
                                                            "Пароли не совпадают"
                                                        )
                                                    );
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            placeholder="Подтвердите пароль"
                                            size="large"
                                        />
                                    </Form.Item>
                                    {/* 
                                    {codeSent && (
                                        <Form.Item
                                            label="Код подтверждения (12 цифр)"
                                            name="code"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Введите код",
                                                },
                                                {
                                                    pattern: /^\d{12}$/,
                                                    message:
                                                        "Код должен содержать 12 цифр",
                                                },
                                            ]}
                                        >
                                            <Input
                                                placeholder="Введите код из письма"
                                                size="large"
                                                maxLength={12}
                                            />
                                        </Form.Item>
                                    )}
                                    <Form.Item>
                                        {!codeSent ? (
                                            <Button
                                                type="default"
                                                block
                                                size="middle"
                                                onClick={handleVerifyEmail}
                                                loading={loading}
                                            >
                                                Подтвердить почту
                                            </Button>
                                        ) : !emailVerified ? (
                                            <Button
                                                type="default"
                                                block
                                                size="middle"
                                                onClick={handleCodeSubmit}
                                                loading={loading}
                                            >
                                                Проверить код
                                            </Button>
                                        ) : null}
                                    </Form.Item> */}

                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            block
                                            size="large"
                                            // disabled={!emailVerified}
                                            loading={loading}
                                            style={{
                                                backgroundColor: "#FAAD14",
                                                borderColor: "#FAAD14",
                                            }}
                                        >
                                            Продолжить
                                        </Button>
                                    </Form.Item>
                                </Form>
                            )}

                            {/* Вторая форма - профиль */}
                            {currentStep === 1 && (
                                <Form
                                    form={profileForm}
                                    layout="vertical"
                                    onFinish={onProfileFinish}
                                    requiredMark={false}
                                >
                                    <Form.Item
                                        name="lastName"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Введите фамилию",
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder="Фамилия"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="firstName"
                                        rules={[
                                            {
                                                required: true,
                                                message: "Введите имя",
                                            },
                                        ]}
                                    >
                                        <Input placeholder="Имя" size="large" />
                                    </Form.Item>

                                    <Form.Item name="middleName">
                                        <Input
                                            placeholder="Отчество (необязательно)"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item name="phone">
                                        <Input
                                            placeholder="+7XXXXXXXXXX"
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="birthDate"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Выберите дату рождения",
                                            },
                                        ]}
                                    >
                                        <DatePicker
                                            style={{ width: "100%" }}
                                            format="DD.MM.YYYY"
                                            disabledDate={(current) =>
                                                current &&
                                                current > dayjs().endOf("day")
                                            }
                                            size="large"
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="agree"
                                        valuePropName="checked"
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Вы должны согласиться",
                                            },
                                        ]}
                                    >
                                        <Checkbox style={{ color: "#fff" }}>
                                            Согласен на обработку персональных
                                            данных
                                        </Checkbox>
                                    </Form.Item>

                                    <Form.Item>
                                        <Flex gap={16}>
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                size="large"
                                                style={{
                                                    flex: 1,
                                                    backgroundColor: "#FAAD14",
                                                    borderColor: "#FAAD14",
                                                }}
                                            >
                                                Завершить регистрацию
                                            </Button>

                                            <Button
                                                type="default"
                                                onClick={handleBack}
                                                size="large"
                                                style={{ flex: 1 }}
                                            >
                                                Назад
                                            </Button>
                                        </Flex>
                                    </Form.Item>
                                </Form>
                            )}
                        </Space>
                    </AuthCard>
                </Flex>
            </Content>
        </Layout>
    );
}
