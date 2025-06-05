import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Profile from './components/Profile';
import Maps from './components/Maps';
import EditMap from './components/EditMap'; // Новый компонент для редактирования карты
import CreateRoomElement from './components/CreateRoomElement'; // Новый компонент для создания комнаты
import JoinSessionPage from './components/JoinSessionPage';
import './components/styles/theme.css';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Главная страница */}
          <Route path="/" element={<Login />} />

          {/* Страница профиля */}
          <Route path="/profile" element={<Profile />} />

          {/* Страница карт */}
          <Route path="/maps/:id" element={<Maps />} />

          {/* Новая страница для редактирования карты */}
          <Route path="/edit-map/:id" element={<EditMap />} />

          <Route
            path="/create-room/:profileId"
            element={<CreateRoomElement />}
          />

          <Route path="/join/:sessionId" element={<JoinSessionPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
