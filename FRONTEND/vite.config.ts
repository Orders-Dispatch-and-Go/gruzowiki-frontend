import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// // https://vite.dev/config/
// export default defineConfig({
// 	plugins: [react()],
// });
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://51.250.34.151:8074',
        changeOrigin: true,
        secure: false,
      },
      '/check': {
        target: 'http://51.250.34.151:8074',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://51.250.34.151:8074',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})