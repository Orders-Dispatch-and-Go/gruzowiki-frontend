// src/components/AuthTabs.tsx
import React from "react";
import { Tabs, type TabsProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./AuthTabs.module.css";

interface AuthTabsProps {
    activeKey: string;
    onTabChange: (key: string) => void;
}

export const AuthTabs: React.FC<AuthTabsProps> = ({
    activeKey,
    onTabChange,
}) => {
    const items: TabsProps["items"] = [
        {
            key: "/login",
            label: "Вход",
        },
        {
            key: "/register",
            label: "Регистрация",
        },
    ];

    return (
        <Tabs
            className={styles.tabs}
            activeKey={activeKey}
            items={items}
            onChange={onTabChange}
        />
    );
};
