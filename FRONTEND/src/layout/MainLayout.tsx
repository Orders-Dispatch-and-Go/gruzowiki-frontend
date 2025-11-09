import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import RoleHeader from "../components/RoleHeader"; // Твой хедер для авторизованных пользователей

const { Content } = Layout;

export default function MainLayout(): React.JSX.Element {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <RoleHeader />
      <Content style={{ padding: "20px" }}>
        <Outlet />
      </Content>
    </Layout>
  );
}