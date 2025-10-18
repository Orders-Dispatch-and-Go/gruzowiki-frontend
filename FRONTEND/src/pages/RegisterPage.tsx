// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Checkbox, Alert, Space, Typography } from "antd";

const { Text } = Typography;

export default function RegisterPage(): React.JSX.Element {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    // TODO: подключи API регистрации
    console.log("Register values:", values);
    setLoading(true);
    
    // Имитация API запроса
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage("Регистрация успешна! Проверьте email для подтверждения.");
    }, 1500);
  };

  return (
     <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Text type="secondary" >
        Появится попозже =)
        </Text>
        <Text type="secondary">Нет аккаунта? <span style={{ color: "#1890ff", cursor: "pointer" }} onClick={() => navigate("/register")}>Регистрация</span></Text>
    </div>
  );
}