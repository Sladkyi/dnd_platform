import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const TrashRoom = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [selectedMap, setSelectedMap] = useState(null);
    const [roomCode, setRoomCode] = useState('');
    const [socket, setSocket] = useState(null);
    const [notification, setNotification] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const maps = location.state?.maps || [];

    // Инициализация WebSocket
    useEffect(() => {
        const newSocket = io('http://localhost:8000');
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Сброс состояния копирования
    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            setIsCopied(true);
        } catch (err) {
            setNotification('Не удалось скопировать код');
        }
    };

    const handleCreateRoom = async () => {
        if (!selectedMap) {
            setNotification('Пожалуйста, выберите карту');
            return;
        }

        const authToken = localStorage.getItem('token');

        try {
            const response = await fetch(`/api/maps/room/CreateNewJoinRoom/${selectedMap.id}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ map_id: selectedMap.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при создании комнаты');
            }

            const roomData = await response.json();
            setRoomCode(roomData.room_code);

            socket.emit('join-room', {
                roomCode: roomData.room_code,
                isMaster: true
            });

            navigate(`/room/${roomData.room_code}`, {
                state: {
                    roomData: roomData,
                    isMaster: true,
                    selectedMap: selectedMap
                }
            });

        } catch (err) {
            setNotification(err.message);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Создание игровой комнаты</h2>

            {/* Уведомления */}
            {notification && (
                <div className="alert alert-danger mb-3">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    {notification}
                </div>
            )}

            {/* Блок с кодом комнаты */}
            {roomCode && (
                <div className="card mb-4 shadow">
                    <div className="card-body text-center">
                        <h5 className="card-title text-success mb-3">
                            <i className="bi bi-check-circle me-2"></i>
                            Комната успешно создана!
                        </h5>
                        <div className="input-group mb-3">
                            <input
                                type="text"
                                className="form-control text-center fw-bold"
                                value={roomCode}
                                readOnly
                                style={{ fontSize: '1.2rem' }}
                            />
                            <button
                                onClick={handleCopyCode}
                                className={`btn ${isCopied ? 'btn-success' : 'btn-outline-primary'}`}
                            >
                                {isCopied ? (
                                    <>
                                        <i className="bi bi-check2 me-2"></i>
                                        Скопировано!
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-clipboard me-2"></i>
                                        Копировать код
                                    </>
                                )}
                            </button>
                        </div>
                        <p className="text-muted small mb-0">
                            Поделитесь этим кодом с другими участниками игры
                        </p>
                    </div>
                </div>
            )}

            {/* Выбор карты */}
            <div className="row mb-4">
                <h5 className="mb-3">
                    <i className="bi bi-map me-2"></i>
                    Выберите игровую карту
                </h5>
                <div className="d-flex overflow-auto gap-3 p-2">
                    {maps.length > 0 ? maps.map(map => (
                        <div
                            key={map.id}
                            className={`card shadow-sm cursor-pointer transition-all ${
                                selectedMap?.id === map.id
                                    ? 'border-primary bg-light'
                                    : 'hover:shadow-lg'
                            }`}
                            style={{
                                width: '20rem',
                                minWidth: '20rem',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => setSelectedMap(map)}
                        >
                            <img
                                src={map.image || '/default-map.png'}
                                className="card-img-top"
                                alt={map.title}
                                style={{
                                    height: '180px',
                                    objectFit: 'cover',
                                    borderTopLeftRadius: 'calc(0.25rem - 1px)',
                                    borderTopRightRadius: 'calc(0.25rem - 1px)'
                                }}
                            />
                            <div className="card-body">
                                <h6 className="card-title d-flex align-items-center">
                                    {map.title}
                                    {selectedMap?.id === map.id && (
                                        <span className="badge bg-success ms-2">
                                            <i className="bi bi-check-lg me-1"></i>
                                            Выбрано
                                        </span>
                                    )}
                                </h6>
                                <p className="card-text text-muted small">
                                    {map.description?.slice(0, 80)}
                                    {map.description?.length > 80 && '...'}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="col-12 text-center py-5">
                            <i className="bi bi-map text-muted display-5"></i>
                            <p className="text-muted mt-3">Нет доступных карт</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Кнопка создания */}
            <div className="text-center mt-5">
                <button
                    onClick={handleCreateRoom}
                    className="btn btn-primary btn-lg px-5 py-3"
                    disabled={!selectedMap}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Создать игровую комнату
                </button>
            </div>
        </div>
    );
};

export default TrashRoom;