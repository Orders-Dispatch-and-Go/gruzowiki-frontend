import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Checkbox, Alert, Space, Layout, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title } = Typography;

export default function UserProfilePage(): React.JSX.Element {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

useEffect(() => {
  if (isAuthenticated) {
    navigate("/dashboard");
    return;
  }

  const registrationInProgress = sessionStorage.getItem("registration_in_progress");
  if (!registrationInProgress) {
    navigate("/login");
  }
}, [isAuthenticated, navigate]);


  const onFinish = (values: any) => {
    if (!values.agree) {
      setError("Вы должны согласиться на обработку персональных данных");
      return;
    }

    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      console.log("User info:", values);

      // Пример login после завершения регистрации
      login(
        { id: "123", email: "user@example.com", name: `${values.firstName} ${values.lastName}` },
        "fake-token"
      );
      sessionStorage.removeItem("registration_in_progress");

      navigate("/dashboard");
    }, 1000);
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
        <Form
          layout="vertical"
          style={{ width: "100%", maxWidth: 400, background: "#fff", padding: 24, borderRadius: 8 }}
          onFinish={onFinish}
        >
          <Title level={3} style={{ textAlign: "center", marginBottom: 24 }}>
            Личная информация
          </Title>

          {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}

          <Form.Item
            label="Фамилия"
            name="lastName"
            rules={[{ required: true, message: "Введите фамилию" }]}
          >
            <Input placeholder="Фамилия" size="large" />
          </Form.Item>

          <Form.Item
            label="Имя"
            name="firstName"
            rules={[{ required: true, message: "Введите имя" }]}
          >
            <Input placeholder="Имя" size="large" />
          </Form.Item>

          <Form.Item
            label="Отчество"
            name="middleName"
          >
            <Input placeholder="Отчество (необязательно)" size="large" />
          </Form.Item>

          <Form.Item
            label="Дата рождения"
            name="birthDate"
            rules={[{ required: true, message: "Выберите дату рождения" }]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD.MM.YYYY"
              disabledDate={(current) => current && current >  dayjs().endOf('day')}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="agree"
            valuePropName="checked"
            rules={[{ required: true, message: "Вы должны согласиться" }]}
          >
            <Checkbox>Согласен на обработку персональных данных</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} size="large">
              Сохранить
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}
