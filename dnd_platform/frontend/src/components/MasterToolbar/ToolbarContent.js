import React from 'react';
import RoomsTab from './RoomsTab';
import ItemsTab from './ItemsTab';
import POITab from './POITab';
import WeatherTab from './WeatherTab';
import PlayersTab from './PlayersTab';
import SessionTab from './SessionTab';

const ToolbarContent = ({ activeTab, mapId }) => {
  if (!activeTab) return null;

  return (
    <div className="toolbar-content-bottom">
      {activeTab === 'rooms' && <RoomsTab mapId={mapId} />}
      {activeTab === 'items' && <ItemsTab mapId={mapId} />}
      {activeTab === 'poi' && <POITab mapId={mapId} />}
      {activeTab === 'weather' && <WeatherTab />}
      {activeTab === 'players' && <PlayersTab />}
      {activeTab === 'session' && <SessionTab />}
    </div>
  );
};

export default ToolbarContent;
