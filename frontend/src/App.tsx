// infinite_diary/frontend/src/App.tsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DiaryPage from './pages/DiaryPage';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔑 오류 해결: 일기 작성 페이지는 반드시 루트 경로 "/"입니다! */}
        <Route path="/" element={<DiaryPage />} />              
        <Route path="/auth" element={<AuthPage />} />            
        <Route path="/calendar" element={<CalendarPage />} />    
      </Routes>
    </BrowserRouter>
  );
}

export default App;