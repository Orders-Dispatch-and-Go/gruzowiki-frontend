// src/hooks/useForgotPassword.ts
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface UseForgotPasswordResult {
  loading: boolean;
  serverError: string | null;
  successMessage: string | null;
  handleForgotPassword: (email: string) => Promise<void>;
  setServerError: (error: string | null) => void;
  setSuccessMessage: (message: string | null) => void;
}

export function useForgotPassword(): UseForgotPasswordResult {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleForgotPassword = async (email: string) => {
    console.log("Forgot password for:", email);
    setLoading(true);
    setServerError(null);
    setSuccessMessage(null);
    
    try {
      // TODO: подключи API восстановления пароля
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoading(false);
      setSuccessMessage("Инструкции по восстановлению пароля отправлены на email");
      
      // После успешной отправки переходим на страницу с кодом подтверждения
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 2000);
    } catch (error) {
      setLoading(false);
      setServerError("Ошибка при отправке запроса");
    }
  };

  return {
    loading,
    serverError,
    successMessage,
    handleForgotPassword,
    setServerError,
    setSuccessMessage
  };
}