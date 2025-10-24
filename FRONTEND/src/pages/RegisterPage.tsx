// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from "react";
import { AuthCard } from "../components/AuthCard";
import { Form, Input, Button, Alert, Space, Layout, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import { AuthTabs } from "../components/AuthTabs";
import { useAuth } from "../context/AuthContext";
import { doRegister, checkEmail } from "../api/auth";

const { Content } = Layout;

export default function RegisterPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);


  const onTabChange = (key: string) => navigate(key);

  const handleVerifyEmail = async (email: string) => {
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
        sessionStorage.setItem("registration_in_progress", "true");
        sessionStorage.setItem("registration_email", email); // сохраняем email
        setEmailVerified(true);
      }
    } catch {
      setServerError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    setServerError(null);
    setLoading(true);
    try {
      const res = await doRegister(values);
      if (!res.ok) setServerError(res.message ?? "Ошибка регистрации");
      else {
        sessionStorage.setItem("registration_in_progress", "true");
        navigate("/profile");
      }
    } catch {
      setServerError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ backgroundColor: "#f5f5f5" }}>
      <Content>
        <Flex justify="center" align="center">
          <AuthCard>
            <AuthTabs activeKey="/register" onTabChange={onTabChange} />
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {serverError && <Alert type="error" message={serverError} showIcon />}
              {successMessage && <Alert type="success" message={successMessage} showIcon />}

              <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Form.Item
                  label="Email"
                  name="email"
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

                <Form.Item
                  label="Подтвердите пароль"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Подтвердите пароль" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) return Promise.resolve();
                        return Promise.reject(new Error("Пароли не совпадают"));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Подтвердите пароль" size="large" />
                </Form.Item>

                <Form.Item
                  label="Код подтверждения"
                  name="code"
                  rules={[{ required: true, message: "Введите код" }]}
                >
                  <Input placeholder="Код из письма" size="large" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="default"
                    block
                    size="middle"
                    onClick={() => {
                      const form = Form.useFormInstance();
                      const email = form.getFieldValue("email");
                      handleVerifyEmail(email);
                    }}
                    loading={loading}
                  >
                    Подтвердить почту
                  </Button>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    size="large"
                    disabled={!emailVerified}
                    loading={loading}
                    style={{ backgroundColor: "orange", borderColor: "orange" }}
                  >
                    Зарегистрироваться
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