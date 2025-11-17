import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/NexusLend/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/metrics': 'http://localhost:4000',
      '/positions': 'http://localhost:4000',
      '/kyc': 'http://localhost:4000',
      '/lending': 'http://localhost:4000'
    }
  }
});
