import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../../../../shared/styles/PlayerPanel.css';
import EditingEntity from '../../../entityEditor/ui/EditingEntity/EditingEntity';
import { normalizeCharacter } from '../../../../shared/utils/normalizeCharacter';

import WeaponBlock from './WeaponBlock';
import CombatActionsBlock from './CombatActionsBlock';
import CharacterPortrait from './CharacterPortrait';
import ActionsBlock from './ActionsBlock';
import PageControls from './PageControls';

const ActionPanel = ({ shape, isMoving }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeWeapon, setActiveWeapon] = useState(0);
  const [showEditor, setShowEditor] = useState(false);
  const [characterData, setCharacterData] = useState(null);
  const [spells, setSpells] = useState([]);
  const [items, setItems] = useState([]);

  const profileId = shape?.owner;

  useEffect(() => {
    if (shape) {
      const data = normalizeCharacter(shape);
      setCharacterData(data);
      // console.log(characterData);
      setSpells([...data.spells]);
      setItems([...data.items]);
    }
  }, [shape]);

  const handleEditorClose = useCallback(() => setShowEditor(false), []);

  if (!characterData) {
    return <div className="action-panel loading">Загрузка...</div>;
  }

  return (
    <div className="action-panel">
      <CharacterPortrait
        shape={shape}
        characterData={characterData}
        setShowEditor={setShowEditor}
      />
      |
      <WeaponBlock
        weapons={characterData.weapons}
        activeWeapon={activeWeapon}
        setActiveWeapon={setActiveWeapon}
      />
      |
      <CombatActionsBlock actions={characterData.combatActions} />
      |
      <ActionsBlock
        currentPage={currentPage}
        spells={spells}
        items={items}
        setSpells={setSpells}
        setItems={setItems}
      />
      |
      <PageControls currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {showEditor && (
        <EditingEntity
          isOpen={true}
          closeModal={handleEditorClose}
          selectedShape={shape}
          profileId={profileId}
        />
      )}
    </div>
  );
};

export default ActionPanel;
