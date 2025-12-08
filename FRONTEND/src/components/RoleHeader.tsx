// components/Header.tsx
import React from "react";
import { Layout, Avatar, Dropdown, Space, Typography, Image, Flex } from "antd";
import {
    UserOutlined,
    LogoutOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import truck from "../assets/truck.svg";
import logoText from "../assets/Logo_text.svg";
import styles from "./AuthHeader.module.css";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const AppHeader: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogoClick = () => {
        if (user?.role === "ROLE_CONSIGNER") {
            navigate("/shipper/home");
        } else if (user?.role === "ROLE_CARRIER") {
            navigate("/carrier/home");
        } else {
            navigate("/");
        }
    };

    const handleProfileClick = () => {
        if (user?.role === "ROLE_CONSIGNER") {
            navigate("/shipper/profile");
        } else if (user?.role === "ROLE_CARRIER") {
            navigate("/carrier/profile");
        }
    };

    const items: MenuProps["items"] = [
        {
            key: "profile",
            icon: <UserSwitchOutlined />,
            label: "Личный кабинет",
            onClick: handleProfileClick,
        },
        {
            type: "divider",
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Выйти",
            onClick: logout,
        },
    ];

    return (
        <AntHeader
            style={{
                background: "#2b347dff",
                padding: "0 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                // boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
        >
            {/* Логотип */}
            {/* либо можно div + Space */}
            <Flex
                align="center"
                gap={16}
                className={styles.logoGroup}
                onClick={handleLogoClick}
                style={{
                    cursor: "pointer",
                }}
            >
                <Image src={truck} alt="truck" width={80} preview={false} />
                <Image
                    src={logoText}
                    alt="GruzоWiki"
                    width={250}
                    preview={false}
                />
            </Flex>

            {/* Информация о пользователе */}
            <Dropdown menu={{ items }} trigger={["click"]}>
                <Space style={{ cursor: "pointer" }}>
                    <Avatar icon={<UserOutlined />} />
                    <Text>{user?.name || user?.email || "Пользователь"}</Text>
                </Space>
            </Dropdown>
        </AntHeader>
    );
};

export default AppHeader;
