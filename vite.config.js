import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env': process.env,
  },
  server: {
    port: 5000,
    host: "0.0.0.0",
    hmr: {
      clientPort: 80,
    },
  },
});