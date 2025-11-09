// src/App.tsx
import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { RequireAuth } from "./components/RequireAuth";
import HomeRedirect from "./components/HomeRedirect";
import AuthLayout from "./layout/AuthLayout";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ShipperMainPage from "./pages/ShipperMainPage";
import MainLayout from "./layout/MainLayout";
import ShipperProfilePage from "./pages/ShipperProfilePage";

export default function App(): React.JSX.Element {
    return (
        <Router>
            <Routes>
                {/* Автоматический редирект с / на /login */}
                <Route path="/" element={<HomeRedirect />} />

                <Route element={<AuthLayout />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPasswordPage />}
                    />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Маршруты для грузоотправителя */}
                <Route
                    path="/shipper"
                    element={
                        <RequireAuth>
                            <MainLayout />
                        </RequireAuth>
                    }
                >
                    <Route path="main" element={<ShipperMainPage />} />
                    <Route path="profile" element={<ShipperProfilePage />} />
                    {/* Здесь будут другие маршруты грузоотправителя */}
                </Route>

                {/* Прямые маршруты для редиректа после логина */}
                <Route
                    path="/shipper/main"
                    element={
                        <RequireAuth>
                            <MainLayout />
                        </RequireAuth>
                    }
                >
                    <Route index element={<ShipperMainPage />} />
                </Route>

                {/* Запасной маршрут */}
                <Route path="*" element={<HomeRedirect />} />
            </Routes>
        </Router>
    );
}