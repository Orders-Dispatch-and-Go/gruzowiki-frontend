// src/api/client.ts
import axios from "axios";

const API_HOST = import.meta.env.VITE_API_HOST ?? "http://192.168.0.100:4000"; // <- замени на свой ip:port
const client = axios.create({
  // baseURL: API_HOST,
  baseURL: '/api',
  // если сервер будет ставить HttpOnly cookie
  // он будет их ставить???
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default client;
