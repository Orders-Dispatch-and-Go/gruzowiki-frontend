import React from "react";
import truck from "../assets/truck.svg";
import logoText from "../assets/Logo_text.svg";
import "./AuthHeader.css";

export const AuthHeader = () => (
  <div className="auth-header">
    <div className="auth-header__images">
      <img src={truck} alt="truck" className="auth-header__image_truck" />
      <img src={logoText} alt="GruzоWiki" className="auth-header__image_logo" />
    </div>
    <h2 className="auth-header__text">Связываем заказчиков и перевозчиков по оптимальному маршруту.</h2>
  </div>
);
