import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  // 🔑 핵심 수정: Vite의 프로젝트 루트를 현재 폴더(frontend/)로 명확히 지정
  root: './', 
  
  plugins: [react()],
  
  // resolve.alias 설정 유지 (절대 경로 @/ 해결용)
  resolve: {
    alias: {
      // @/ 경로 별칭을 src 폴더로 정확히 매핑
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  // 서버 설정 및 API 프록시 유지
  server: {
    host: true, 
    port: 3000,
    
    proxy: {
      '/api': {
        target: 'http://localhost:5000', 
        changeOrigin: true, 
        secure: false,
      },
    },
  }
});