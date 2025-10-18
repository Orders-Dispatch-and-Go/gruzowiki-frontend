import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Alert, Space, Typography } from "antd";
import { doLogin } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { AuthHeader } from "../components/AuthHeader";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginPage(): React.JSX.Element {
  const redirectAfterLogin = "/dashboard";
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onFinish = async (values: LoginFormValues) => {
    //
    setServerError(null);
    setEmailError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await doLogin({ email: values.email, password: values.password, remember: values.remember });

      if (!res.ok) {
        if (res.code === "INVALID_EMAIL") {
          // Отдельное состояние для некорректного емейла (как на скринах)
          setEmailError(res.message ?? "Неверный email");
        } else if (res.code === "AUTH_FAIL") {
          setServerError(res.message ?? "Ошибка авторизации");
        } else {
          setServerError(res.message ?? "Неизвестная ошибка");
        }
      } else {
        // Успех — сохраняем в контекст и редиректим
        if (res.data?.user && res.data?.token) {
            const { user, token } = res.data;
            login(user, token);
            setSuccessMessage("Успешный вход! Перенаправление...");
            setTimeout(() => navigate(redirectAfterLogin), 800);
        } else {
            setServerError("Некорректные данные от сервера");
        }
      }
    } catch (err) {
      setServerError("Сервер недоступен. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
    ////
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
      <div style={{ width: 420 }}>
        <AuthHeader />

        <Space direction="vertical" style={{ width: "100%" }}>
          {/* Показываем разные баннеры в зависимости от состояния */}
          {emailError && <Alert type="error" message="Неверный email" description={emailError} showIcon />}
          {serverError && <Alert type="error" message="Ошибка авторизации" description={serverError} showIcon />}
          {successMessage && <Alert type="success" message={successMessage} showIcon />}

          <Form
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="email"
              validateStatus={emailError ? "error" : undefined}
              help={emailError ?? undefined}
              rules={[
                { required: true, message: "Введите email" },
                { type: "email", message: "Введите корректный email" },
              ]}
            >
              <Input placeholder="Введите email" />
            </Form.Item>

            <Form.Item
              label="Пароль"
              name="password"
              rules={[{ required: true, message: "Введите пароль" }]}
            >
              <Input.Password placeholder="Пароль" />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox>Запомнить меня</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Войти
              </Button>
            </Form.Item>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <Text type="secondary" onClick={() => navigate("/forgot-password")} style={{ cursor: "pointer" }}>
                Забыли пароль?
              </Text>
              <Text type="secondary">Нет аккаунта? <span style={{ color: "#1890ff", cursor: "pointer" }} onClick={() => navigate("/register")}>Регистрация</span></Text>
            </div>
          </Form>
        </Space>
      </div>
    </div>
  );
}
