import React, { useState } from "react";
import { 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Alert, 
  Space, 
  Typography, 
  Card, 
  Layout,
  Flex  
} from "antd";
import { doLogin } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const { Text, Title } = Typography;
const { Content } = Layout;

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
    setServerError(null);
    setEmailError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await doLogin({ email: values.email, password: values.password, remember: values.remember });

      if (!res.ok) {
        if (res.code === "INVALID_EMAIL") {
          setEmailError(res.message ?? "Неверный email");
        } else if (res.code === "AUTH_FAIL") {
          setServerError(res.message ?? "Ошибка авторизации");
        } else {
          setServerError(res.message ?? "Неизвестная ошибка");
        }
      } else {
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
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content>
        <Flex 
          justify="center" 
          align="center" 
          style={{ height: "100vh", padding: "20px" }}
        >
          <Card 
            title={<Title level={2} style={{ textAlign: "center", margin: 0 }}>Вход в систему</Title>}
            style={{ 
              width: "100%", 
              maxWidth: 400,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
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
                  <Input placeholder="Введите email" size="large" />
                </Form.Item>

                <Form.Item
                  label="Пароль"
                  name="password"
                  rules={[{ required: true, message: "Введите пароль" }]}
                >
                  <Input.Password placeholder="Пароль" size="large" />
                </Form.Item>

                <Form.Item name="remember" valuePropName="checked">
                  <Checkbox>Запомнить меня</Checkbox>
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button type="primary" htmlType="submit" block loading={loading} size="large">
                    Войти
                  </Button>
                </Form.Item>
              </Form>

              <Flex justify="space-between" align="center">
                <Text 
                  type="secondary" 
                  onClick={() => navigate("/forgot-password")} 
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  Забыли пароль?
                </Text>
                <Text type="secondary" style={{ fontSize: "14px" }}>
                  Нет аккаунта?{" "}
                  <Link to="/register" style={{ fontWeight: 500 }}>
                    Регистрация
                  </Link>
                </Text>
              </Flex>
            </Space>
          </Card>
        </Flex>
      </Content>
    </Layout>
  );
}