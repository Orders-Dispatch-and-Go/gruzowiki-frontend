import React from "react";
import { Layout, Typography, Space, Image } from "antd";
import truck from "../assets/truck.svg";
import logoText from "../assets/Logo_text.svg";
import styles from "./AuthHeader.module.css";

const { Header } = Layout;
const { Paragraph } = Typography;

export const AuthHeader = () => {

  return (
    <Header className={styles.header}>
      <Space align="center" size={16} className={styles.logoGroup}>
        <Image src={truck} alt="truck" width={80} preview={false} />
        <Image src={logoText} alt="GruzоWiki" width={250} preview={false} />
      </Space>
      <Paragraph className={styles.slogan}>
        Связываем заказчиков и перевозчиков по оптимальному маршруту.
      </Paragraph>
    </Header>
  );
};
