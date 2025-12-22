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
import ShipperCreateRequestPage from "./pages/ShipperCreateRequestPage";
import RequestCreatedPage from "./pages/ShipperRequestCreatedPage";
import ConsignerPlaceholderPage from "./pages/ConsignerPlaceholderPage";
import 'leaflet/dist/leaflet.css';


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
                    <Route path="home" element={<ShipperMainPage />} />
                    <Route path="profile" element={<ShipperProfilePage />} />
                    <Route path="create-request" element={<ShipperCreateRequestPage />} />
                    <Route path="request/success/:id" element={<RequestCreatedPage />} />

                    {/* Здесь будут другие маршруты грузоотправителя */}
                </Route>

                {/* Маршруты для грузоперевозчика */}
                <Route
                    path="/carrier"
                    element={
                        <RequireAuth>
                            <MainLayout />
                        </RequireAuth>
                    }
                >
                    <Route path="home" element={<ConsignerPlaceholderPage />} />
                    {/* Здесь будут другие маршруты грузоотправителя */}
                </Route>


                {/* Запасной маршрут */}
                <Route path="*" element={<HomeRedirect />} />
            </Routes>
        </Router>
    );
}