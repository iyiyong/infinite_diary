import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import axios from 'axios';

// 🚨 [핵심 수정] 환경 변수에서 백엔드 주소를 가져옵니다.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 1. 모든 axios 요청의 기본 주소를 백엔드로 설정합니다.
// (이제 /api/auth/login 이라고만 써도 알아서 백엔드로 날아갑니다!)
axios.defaults.baseURL = API_URL;

// 2. 쿠키를 주고받으려면 이 설정이 필수입니다.
axios.defaults.withCredentials = true;

console.log("✅ Axios Base URL 설정됨:", API_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)