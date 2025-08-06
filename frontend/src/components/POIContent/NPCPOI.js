import React from 'react';

const NPCPOI = ({ data, onChange }) => {
  return (
    <div className="poi-content">
      <label>
        ID NPC:
        <input
          type="number"
          value={data.npc_id || ''}
          onChange={(e) => onChange({ npc_id: parseInt(e.target.value) })}
        />
      </label>
      <label>
        Поведение:
        <select
          value={data.behavior || 'neutral'}
          onChange={(e) => onChange({ behavior: e.target.value })}
        >
          <option value="neutral">Нейтральное</option>
          <option value="friendly">Дружелюбное</option>
          <option value="hostile">Враждебное</option>
        </select>
      </label>
      <label>
        Диалог:
        <textarea
          value={data.dialogue || ''}
          onChange={(e) => onChange({ dialogue: e.target.value })}
          rows={3}
        />
      </label>
    </div>
  );
};

export default NPCPOI;