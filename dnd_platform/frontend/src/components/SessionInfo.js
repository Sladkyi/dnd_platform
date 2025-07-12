// components/SessionInfo.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaUsers, FaCrown } from 'react-icons/fa';
import './styles/SessionInfo.css';

const SessionInfo = ({ players, currentTurnShapeId }) => {
  const [pulse, setPulse] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (currentTurnShapeId) {
      const player = players.find(
        (p) => p.character?.shape_id === currentTurnShapeId
      );
      setCurrentPlayer(player);
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(timer);
    } else {
      setCurrentPlayer(null);
    }
  }, [currentTurnShapeId, players]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <motion.div
      className="floating-session-info"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Заголовок с кнопкой свернуть */}
      <div className="floating-header" onClick={toggleExpand}>
        <div className="header-content">
          <FaUsers className="players-icon" />
          <span className="players-count">{players.length}</span>
          {currentTurnShapeId && (
            <div className="current-turn-indicator">
              <FaCrown className="crown-icon" />
              <span>Ход</span>
            </div>
          )}
        </div>
        <button className="toggle-btn">
          {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {/* Основной контент */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="floating-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Текущий игрок */}
            <div className="current-player-section">
              <div className="section-title">Сейчас ходит</div>
              <AnimatePresence mode="wait">
                {currentTurnShapeId ? (
                  <motion.div
                    key={currentTurnShapeId}
                    className={`current-player ${pulse ? 'pulse' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="player-avatar">
                      {currentPlayer?.character?.avatar || '👤'}
                    </div>
                    <div className="player-details">
                      <div className="usernameSession">
                        {currentPlayer?.username || 'Неизвестный игрок'}
                      </div>
                      <div className="character">
                        {currentPlayer?.character?.name || 'Без персонажа'}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="waiting"
                    className="waiting-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="loader"></div>
                    <span>Ожидаем хода...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Список игроков */}
            <div className="players-section">
              <div className="section-title">Игроки</div>
              <div className="players-list">
                {players.map((player) => (
                  <div
                    key={player.id || player.username}
                    className={`player-item ${player.character?.shape_id === currentTurnShapeId ? 'current' : ''}`}
                  >
                    <div className="player-icon">
                      {player.character?.avatar || '👤'}
                      {player.character?.shape_id === currentTurnShapeId && (
                        <div className="active-indicator"></div>
                      )}
                    </div>
                    <div className="player-name">{player.username}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SessionInfo;
