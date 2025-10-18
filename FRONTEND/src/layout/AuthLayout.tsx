// src/layout/AuthLayout.tsx
import React from "react";
import { AuthHeader } from "../components/AuthHeader";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 24, minHeight: "100vh", alignItems: "center" }}>
      <div style={{ width: 420 }}>
        <AuthHeader />
        {children}
      </div>
    </div>
  );
}