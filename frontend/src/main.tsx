import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ▼▼▼▼▼ [여기 추가] 이 두 줄을 꼭 복사해서 넣어주세요! ▼▼▼▼▼
import axios from 'axios';
axios.defaults.withCredentials = true;
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// 'root' 요소를 찾아서 React 앱을 시작합니다.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)