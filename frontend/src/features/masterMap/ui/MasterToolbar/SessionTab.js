import React, { useState } from 'react';

const SessionTab = ({
  onInvitePlayers,
  onResetMap,
  onNextTurn,
  onEndSession,
}) => {
  const [copied, setCopied] = useState(false);

  const handleInvite = async () => {
    const url = await onInvitePlayers();
    if (url) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Ошибка копирования:', err);
        window.prompt('Скопируйте ссылку вручную:', url);
      }
    }
  };

  return (
    <div className="tab-panel">
      <button onClick={handleInvite}>🔗</button>
      <button onClick={onResetMap}>♻️</button>
      <button onClick={onNextTurn}>⏭️</button>
      <button onClick={onEndSession} className="danger">
        ⏹️
      </button>
    </div>
  );
};

export default SessionTab;
