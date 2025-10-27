// src/pages/RegisterPage.tsx
import React, { useState, useEffect } from "react";
import { AuthCard } from "../components/AuthCard";
import { Form, Input, Button, Alert, Space, Layout, Flex, Radio, Typography } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { AuthTabs } from "../components/AuthTabs";
import { useAuth } from "../context/AuthContext";
import { doRegister, checkEmail } from "../api/auth";

const { Content } = Layout;
const { Text } = Typography;

export default function RegisterPage(): React.JSX.Element {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [form] = Form.useForm();



  const onTabChange = (key: string) => navigate(key);

  const handleVerifyEmail = async () => {    
    const email = form.getFieldValue("email");
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
        sessionStorage.setItem("registration_email", email); // сохраняем email
        setEmailVerified(true);
      }
    } catch {
      setServerError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    const code = form.getFieldValue("code");
    const email = form.getFieldValue("email");
    
    if (!code || code.length !== 12) {
      setServerError("Код должен содержать 12 цифр");
      return;
    }

    setLoading(true);
    setServerError(null);
    
    try {
      // Здесь должна быть проверка кода на сервере
      // Пока имитируем успешную проверку
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Если код верный
      setEmailVerified(true);
      setSuccessMessage("Email подтвержден! Заполните остальные данные.");
      sessionStorage.setItem("registration_in_progress", "true");
      sessionStorage.setItem("registration_email", email);
      sessionStorage.setItem("registration_role", form.getFieldValue("role"));
    } catch {
      setServerError("Неверный код подтверждения");
      form.setFieldValue("code", ""); // Очищаем поле при ошибке
    } finally {
      setLoading(false);
    }
  };

  
  const onFinish = async (values: any) => {
    if (!emailVerified) {
      setServerError("Сначала подтвердите email");
      return;
    }
    
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

              <Form 
                form={form}
                layout="vertical" 
                onFinish={onFinish} 
                requiredMark={false}
                initialValues={{ role: "shipper" }}
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Введите email" },
                    { type: "email", message: "Введите корректный email" },
                    { max: 128, message: "Максимум 128 символов" }
                  ]}
                >
                  <Input 
                    placeholder="Введите email" 
                    size="large" 
                    disabled={codeSent}
                  />
                </Form.Item>

                <Form.Item
                  label="Роль"
                  name="role"
                >
                  <Radio.Group>
                    <Radio value="shipper">Грузоотправитель</Radio>
                    <Radio value="carrier">Грузоперевозчик</Radio>
                  </Radio.Group>
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text type="warning">
                      Роль нельзя будет изменить. Если вы захотите использовать приложение в другой роли, 
                      то вам понадобится зарегистрировать аккаунт на новую почту.
                    </Typography.Text>
                  </div>
                </Form.Item>

                <Form.Item
                  label="Пароль"
                  name="password"
                  rules={[
                    { required: true, message: "Введите пароль" },
                    { max: 64, message: "Максимум 64 символа" }
                  ]}
                >
                  <Input.Password placeholder="Пароль" size="large" />
                </Form.Item>

                <Form.Item
                  label="Подтвердите пароль"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Подтвердите пароль" },
                    { max: 64, message: "Максимум 64 символа" },
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

                {codeSent && (
                  <Form.Item
                    label="Код подтверждения (12 цифр)"
                    name="code"
                    rules={[
                      { required: true, message: "Введите код" },
                      { pattern: /^\d{12}$/, message: "Код должен содержать 12 цифр" }
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

                <Form.Item style={{ textAlign: "center", marginBottom: 0 }}>
                  <Link to="/login">
                    <Button type="link">Войти</Button>
                  </Link>
                </Form.Item>
              </Form>
            </Space>
          </AuthCard>
        </Flex>
      </Content>
    </Layout>
  );
}
