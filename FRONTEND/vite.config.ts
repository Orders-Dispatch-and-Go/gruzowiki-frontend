import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/auth": {
                target: "http://51.250.34.151:8074",
                changeOrigin: true,
                secure: false,
            },
            "/check": {
                target: "http://51.250.34.151:8074",
                changeOrigin: true,
                secure: false,
            },
            "/users": {
                target: "http://51.250.34.151:8074",
                changeOrigin: true,
                secure: false,
            },
            "/cargo_request": {
                target: "http://51.250.34.151:8075",
                changeOrigin: true,
                secure: false,
            },
            "/cargo": {
                target: "http://51.250.34.151:8075",
                changeOrigin: true,
                secure: false,
            },
            "/recipients": {
                target: "http://51.250.34.151:8075",
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
