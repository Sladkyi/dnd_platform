import React from 'react';
import SessionInfo from '../../playerMap/ui/SessionInfo';

const PlayerSessionInfo = ({ sessionId, players, currentTurnShapeId }) => {
  if (!sessionId) return null;

  return (
    <SessionInfo
      players={players}
      currentTurnShapeId={currentTurnShapeId}
    />
  );
};

export default PlayerSessionInfo;
