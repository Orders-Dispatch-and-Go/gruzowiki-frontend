import React from "react";
import { Typography } from "antd";
import truck from "../assets/truck.svg";
import logoText from "../assets/Logo_text.svg";
import "./AuthHeader.css";

const { Title, Paragraph } = Typography;

export const AuthHeader = () => (
  <div className="auth-header">
    <div className="auth-header__images">
      <img src={truck} alt="truck" className="auth-header__image_truck" />
      <img src={logoText} alt="GruzоWiki" className="auth-header__image_logo" />
    </div>
    <Paragraph className="auth-header__text">
      Связываем заказчиков и перевозчиков по оптимальному маршруту.
    </Paragraph>
  </div>
);