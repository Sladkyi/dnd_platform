import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import useMapStore from '../store/useMapStore';
import MapCanvas from './MapCanvas';
import ToolPanel from './ToolPanel';
import ModalLayer from './ModalLayer';
import PlayerSessionInfo from './PlayerSessionInfo';
import PlayerAgent from '../../playerMap/ui/PlayerAgent';
import '../../../shared/styles/EditMap.css';
import { initializeEditor } from '../lib/initializeEditor';

const EditMap = () => {
  const { id: mapId } = useParams();
  const location = useLocation();
  const profileId = location.state?.profileId;
  const role = location.state?.role;
  const shapeId = location.state?.shapeId;

  const { mapData, loading, error, scale, setMapId } = useMapStore((s) => ({
    mapData: s.mapData,
    loading: s.loading,
    error: s.error,
    scale: s.scale,
    setMapId: s.setMapId,
  }));

  useEffect(() => {
    if (mapId) {
      setMapId(parseInt(mapId, 10));
    }
  }, [mapId, setMapId]);

  useEffect(() => {
    initializeEditor(mapId, profileId).then(() => {
      console.log('Редактор инициализирован');
    });
  }, [mapId, profileId]);

  // Initialize hooks for map interactions
  useMapHandlers();
  useMapActions();

  if (loading) return <div className="loading">Загрузка карты...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!mapData) return <div className="error">Нет данных карты</div>;

  if (role === 'player') {
    return <PlayerAgent shapeId={shapeId} mapId={mapId} scale={scale} />;
  }

  return (
    <div className="edit-map-container">
      <PlayerSessionInfo />
      <MapCanvas />
      <ToolPanel />
      <ModalLayer />
    </div>
  );
};

export default EditMap;

