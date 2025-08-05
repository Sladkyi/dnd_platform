import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Profile from '../features/profile/Profile';
import Maps from '../components/Maps';
import EditMap from '../features/masterMap/ui/EditMap'; // Новый компонент для редактирования карты

import JoinSessionPage from '../components/JoinSessionPage';
import '../shared/styles/theme.css';
import PlayerAgent from '../features/playerMap/ui/PlayerAgent';
import CreateSpell from '../components/CreateSpell';
import SpellLibrary from '../features/playerMap/ui/SpellLibrary';
import '../shared/styles/Profile.css';
import CreateItem from '../components/CreateItem';
import CreateRace from '../components/CreateRace';
import CreateClass from '../components/CreateClass';
import CreateAttack from '../components/CreateAttack';
// import './all.css';
const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/maps/:id" element={<Maps />} />
          <Route path="/edit-map/:id" element={<EditMap />} />
          <Route
            path="/create-room/:profileId"

          />
          <Route path="/player/:mapId/:shapeId" element={<PlayerAgent />} />
          <Route path="/join/:sessionId" element={<JoinSessionPage />} />
          <Route path="/create-spell/:id" element={<CreateSpell />} />
          <Route path="/spellLibrary/:id" element={<SpellLibrary />} />

          {/* 🔥 Новые маршруты для создания сущностей */}
          <Route path="/create-item/:id" element={<CreateItem />} />
          <Route path="/create-race/:id" element={<CreateRace />} />
          <Route path="/create-class/:id" element={<CreateClass />} />
          <Route path="/create-attack/:id" element={<CreateAttack />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
