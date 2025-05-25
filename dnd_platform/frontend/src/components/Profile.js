import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { MyEntities } from "./MyEntities";
import JoinRoomModal from "./JoinRoomModal";
import './Profile.css';

const Profile = ({ profile }) => {
    const navigate = useNavigate();

    // Состояние для открытия/закрытия модального окна
    const [modalJoinRoom, setModalJoinRoom] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState(null);  // Состояние для хранения выбранного ID комнаты

    const handleGoToMaps = () => navigate(`/maps/${profile.id}`);
    const handleEditMap = (mapId) => navigate(`/edit-map/${mapId}`);
    const createGameRoom = () => navigate(`/create-room/${profile.id}`, { state: { maps: profile.maps } });

    const handleJoinGame = (roomId) => {
        setSelectedRoomId(roomId);
        setModalJoinRoom(true);  // Открыть модальное окно при выборе комнаты
    };

    return (
        <div className="profile-container">
            {/* Шапка профиля */}
            <header className="profile-header">
                <div className="avatar-container">
                    <img
                        src={profile.avatar || '/default-avatar.webp'}
                        alt="Аватар"
                        className="profile-avatar"
                    />
                </div>
                <div className="profile-info">
                    <h1 className="profile-name">{profile.username}</h1>
                    <p className="profile-bio">
                        {profile.bio || 'Добавьте описание профиля'}
                    </p>
                </div>
            </header>

            {/* Основное содержимое */}
            <main className="main-content">
                {/* Секция управления */}
                <section className="actions-section">
                    <button
                        onClick={() => handleGoToMaps()}
                        className="primary-button"
                    >
                        + Создать карту
                    </button>
                    <button
                        onClick={() => handleJoinGame()}
                        className="primary-button"
                    >
                        Присоединиться к игре
                    </button>
                </section>

                {/* Секция карт */}
                <section className="cards-section">
                    <h2 className="section-title">Мои карты</h2>
                    <div className="cards-grid">
                        {profile.maps.map((map) => (
                            <div
                                key={map.id}
                                className="map-card"
                                onClick={() => handleEditMap(map.id)}
                            >
                                <img
                                    src={map.image || 'null'}
                                    alt={map.title}
                                    className="card-image"
                                />
                                <div className="card-content">
                                    <h3 className="card-title">{map.title}</h3>
                                    <div className="card-meta">
                                        <span>🕒 15 мин назад</span>
                                        <span>👥 3 участника</span>
                                    </div>
                                </div>
                                {/* Кнопка для присоединения к комнате */}
                                <button
                                    className="join-room-button"
                                    onClick={() => handleJoinGame(map.id)}
                                >
                                    Присоединиться
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
                {/* Секция сущностей */}
                <MyEntities profile={profile} />
            </main>

            {/* Фаб-кнопка */}
            <button
                className="fab-button"
                onClick={() => navigate(`/create-room/${profile.id}`)}
            >
                Запустить игру
            </button>
        </div>
    );
};

export default Profile;
