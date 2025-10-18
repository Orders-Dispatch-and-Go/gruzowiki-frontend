import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Ждем завершения загрузки

    if (isAuthenticated) {
      navigate("/dashboard", { replace: true }); // На главную для авторизованных
    } else {
      navigate("/login", { replace: true }); // На логин для гостей
    }
  }, [isAuthenticated, loading, navigate]);

  // Пока загружается - показываем загрузку
  if (loading) {
    return <div>Загрузка...</div>;
  }

  return <div>Перенаправление...</div>;
}