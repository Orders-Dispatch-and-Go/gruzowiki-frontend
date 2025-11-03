// src/pages/ForgotPasswordPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Alert, Space, Typography, Card, Layout, Flex } from "antd";
import { AuthCard } from "../components/AuthCard";
import { AuthTabs } from "../components/AuthTabs";
import { useForgotPassword } from "../hooks/useForgotPassword";

const { Text } = Typography;
const { Content } = Layout;

export default function ForgotPasswordPage(): React.JSX.Element {
  const navigate = useNavigate();

  const {
    loading,
    serverError,
    successMessage,
    handleForgotPassword
  } = useForgotPassword();

  const onTabChange = (key: string) => {
    navigate(key);
  };

  const onFinish = async (values: { email: string }) => {
    await handleForgotPassword(values.email);
  };

  const handleBack = () => {
    navigate("/login");
  };

  return (
    <Layout>
      <Content>
        <Flex justify="center" align="center">
          <AuthCard>
            
            {/* Форма восстановления пароля */}
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {serverError && <Alert type="error" message="Ошибка" description={serverError} showIcon />}
              {successMessage && <Alert type="success" message={successMessage} showIcon />}

              <Text>
                Введите email, указанный при регистрации. Мы отправим вам код подтверждения для восстановления пароля.
              </Text>

              <Form
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Введите email" },
                    { type: "email", message: "Введите корректный email" },
                  ]}
                >
                  <Input placeholder="Введите ваш email" size="large" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    block 
                    loading={loading} 
                    size="large" 
                    style={{ backgroundColor: "orange", borderColor: "orange" }}
                  >
                    Отправить новый пароль
                  </Button>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button 
                    type="default" 
                    block 
                    size="large" 
                    onClick={handleBack}
                  >
                    Назад
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