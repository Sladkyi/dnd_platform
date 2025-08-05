import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import JoinRoomModal from '../../components/JoinRoomModal';
import { MyEntities } from '../../components/MyEntities';
import axiosInstance from '../../app/axiosInstance';
import useMapStore from '../masterMap/store/useMapStore';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('maps');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const { setProfileId } = useMapStore();

  const fetchProfile = async () => {
    try {
      const response = await axiosInstance.get('/profile/me/');
      console.log('👤 PROFILE DATA:', response.data);
      setProfile(response.data);
      setProfileId(response.data.id); // сохраняем в Zustand
    } catch (err) {
      console.error(err);
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const access = localStorage.getItem('access');
    if (!access) {
      navigate('/login', { replace: true });
    } else {
      fetchProfile();
    }
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    sessionStorage.clear();
    window.location.replace('/login');
  };

  const handleEdit = (mapId) => {
    navigate(`/edit-map/${mapId}`, {
      state: { role: 'master' },
    });
  };

  const handleJoin = (roomId) => {
    setSelectedRoom(roomId);
    setShowJoinModal(true);
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;
  if (!profile) return null;

  return (
    <div className="profile-wrapper">
      <div className="profile-header">
        <div className="avatar-block">
          <img
            src={profile.avatar || '/default-avatar.webp'}
            alt="avatar"
            className="avatar-img"
          />
        </div>
        <div className="profile-details">
          <div className="creation-buttons">
            <button onClick={() => navigate(`/create-item/${profile.id}`)}>Создать предмет</button>
            <button onClick={() => navigate(`/create-spell/${profile.id}`)}>Создать заклинание</button>
            <button onClick={() => navigate(`/create-race/${profile.id}`)}>Создать расу</button>
            <button onClick={() => navigate(`/create-class/${profile.id}`)}>Создать класс</button>
            <button onClick={() => navigate(`/create-attack/${profile.id}`)}>Создать атаку</button>
            <button onClick={() => navigate(`/maps/${profile.id}`)}>Создать карту</button>
            <button onClick={() => navigate(`/maps/${profile.id}`)}>Рейтинговые пвп бои</button>
            <button onClick={() => navigate(`/maps/${profile.id}`)}>Совет королей</button>
          </div>

          <h1 className="username">{profile.username}</h1>
          <p className="bio">{profile.bio || 'Добавьте описание профиля'}</p>

          <div className="stats">
            <div className="stat">
              <span>{profile.maps.length}</span>
              <label>карты</label>
            </div>
            <div className="stat">
              <span>24</span>
              <label>сессии</label>
            </div>
            <div className="stat">
              <span>8</span>
              <label>друзья</label>
            </div>
          </div>
        </div>

        <button className="logout" onClick={logout}>
          Выйти
        </button>
      </div>

      <div className="profile-tabs">
        <button className={tab === 'maps' ? 'active' : ''} onClick={() => setTab('maps')}>
          Карты
        </button>
        <button className={tab === 'entities' ? 'active' : ''} onClick={() => setTab('entities')}>
          Сущности
        </button>
      </div>

      <div className="profile-content">
        {tab === 'maps' && (
          <div className="map-grid">
            {profile.maps.map((map) => (
              <div className="map-tile" key={map.id}>
                <div className="tile-img" onClick={() => handleEdit(map.id)}>
                  <img src={map.image || '/default-map.webp'} alt={map.title} />
                </div>
                <div className="tile-info">
                  <h3>{map.title}</h3>
                  <div className="tile-meta">
                    <span>🕒 12.06.2023</span>
                    <span>📦 12.5 MB</span>
                  </div>
                  <div className="tile-actions">
                    <button onClick={() => handleEdit(map.id)}>Редактировать</button>
                    <button onClick={() => handleJoin(map.id)}>Играть</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'entities' && <MyEntities profile={profile} />}
      </div>

      <button className="fab" onClick={() => navigate(`/create-room/${profile.id}`)}>
        +
      </button>

      <JoinRoomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        roomId={selectedRoom}
      />
    </div>
  );
};

export default Profile;
