// src/App.tsx
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
// import { RequireAuth } from "./components/RequireAuth";
import HomeRedirect from "./components/HomeRedirect";

export default function App(): React.JSX.Element {
  return (
	<Router>
	<Routes>
		{/* Автоматический редирект с / на /login */}
        <Route path="/" element={< HomeRedirect />} />
		


		{/* Публичные страницы */}
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/register" element={<RegisterPage />} /> */}

		{/* Main Layout contains header for authorized users -- needs RequireAuth */}
        {/* <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="my-route" element={<RouteBuilder />} />
          <Route path="routes/:routeId" element={<RouteResult />} />
          <Route path="ready-routes" element={<ReadyRoutesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route> */}
	</Routes>
	</Router>
  );
}

