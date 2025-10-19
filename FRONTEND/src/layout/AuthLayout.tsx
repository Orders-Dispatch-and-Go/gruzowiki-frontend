import React from "react";
import { Outlet } from "react-router-dom";
import { AuthHeader } from "../components/AuthHeader";
import "./AuthLayout.css";

export default function AuthLayout(): React.JSX.Element {
  return (
    <div className="auth-layout">
      <AuthHeader />
      <main className="auth-layout__main">
        <Outlet />
      </main>
    </div>
  );
}