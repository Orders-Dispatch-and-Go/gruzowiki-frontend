// src/components/AuthCard.tsx
import React from "react";
import { Card } from "antd";
import styles from "./AuthCard.module.css";

export const AuthCard: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <Card className={styles.authCard}>{children}</Card>;
};
