import React from "react";
import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { AuthHeader } from "../components/AuthHeader";

const { Content } = Layout;

export default function AuthLayout(): React.JSX.Element {
  return (
    <Layout 
    style={{ minHeight: "100vh" }}
    >
      <AuthHeader />
      <Content 
      style={{padding: "20px"}}
      >
        <Outlet />
      </Content>
    </Layout>
  );
}