// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { AuthCard } from "../components/AuthCard";
import { 
  Form, 
  Input, 
  Button, 
  Checkbox, 
  Alert, 
  Space, 
  // Card, 
  Layout,
  Flex,
  Row,
  Col
} from "antd";
import { doLogin } from "../api/auth";
import { useAuth, type User } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { AuthTabs } from "../components/AuthTabs";
import { usersApi } from "../api/users";

const { Content } = Layout;

type LoginFormValues = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginPage(): React.JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onTabChange = (key: string) => {
    navigate(key);
  };

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
        if (res.data?.token) {
          const { user, token } = res.data;
          login(token, null, values.remember);

          try {
            const userResponse = await usersApi.getCurrentUser();
          console.log("👤 Данные пользователя:", userResponse);
          
          // Обновляем пользователя в AuthContext
          // Нужно добавить метод updateUser в AuthContext или перелогиниться
          const user: User = {
            id: userResponse.id.toString(),
            email: userResponse.email,
            name: `${userResponse.firstName} ${userResponse.secondName}`,
            role: userResponse.rolesId.includes(1) ? 'ROLE_CONSIGNER' : 'ROLE_CARRIER' // нужно уточнить маппинг ролей
          }

          // Обновляем контекст с пользователем
          login(token, user, values.remember);


          setSuccessMessage("Успешный вход! Перенаправление...");
          // Редирект в зависимости от роли
          let redirectTo = "/shipper/home";
          if (user?.role === 'ROLE_CARRIER') {
            redirectTo = "/carrier/home";
          }
          setTimeout(() => navigate(redirectTo), 800);

        }catch (userErr) {
           console.error("❌ Ошибка получения данных пользователя:", userErr);
          setServerError("Ошибка загрузки данных пользователя");
        }
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
    <Layout>
      <Content>
        <Flex 
          justify="center" 
          align="center" 
        >
          <AuthCard >
            {/* Табы */}
            <AuthTabs activeKey="/login" onTabChange={onTabChange} />
            
            {/* Форма входа */}
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {emailError && <Alert type="error" message="Неверный email" description={emailError} showIcon />}
              {serverError && <Alert type="error" message="Ошибка авторизации" description={serverError} showIcon />}
              {successMessage && <Alert type="success" message={successMessage} showIcon />}

              <Form
                className="auth-form"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                requiredMark={false}
              >
                <Form.Item
                  // label="Email"
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
                  // label="Пароль"
                  name="password"
                  rules={[{ required: true, message: "Введите пароль" }]}
                >
                  <Input.Password placeholder="Пароль" size="large" />
                </Form.Item>

                <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                  <Col>
                    <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
                      <Checkbox>Запомнить меня</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col>
                    <Link to="/forgot-password" >
                      Забыли пароль?
                    </Link>
                  </Col>
                </Row>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" block loading={loading} size="large" style={{ backgroundColor: "orange", borderColor: "orange" }} >
                    Войти
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </AuthCard>
        </Flex>
      </Content>
    </Layout>
  );
}