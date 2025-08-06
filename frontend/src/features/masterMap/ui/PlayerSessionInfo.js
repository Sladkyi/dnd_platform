import React from 'react';
import SessionInfo from '../../playerMap/ui/SessionInfo';
import useMapStore from '../store/useMapStore';

const PlayerSessionInfo = () => {
  const { sessionId, players, currentTurnShapeId } = useMapStore();
  if (!sessionId) return null;

  return <SessionInfo players={players} currentTurnShapeId={currentTurnShapeId} />;
};

export default PlayerSessionInfo;
