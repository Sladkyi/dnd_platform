import React from 'react';

const StatusIndicator = ({ status }) => {
  if (!status) return null;

  return (
    <div
      className="status-indicator"
      title={status}
      style={{
        padding: '2px 6px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: 'white',
        marginRight: '4px',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </div>
  );
};

export default StatusIndicator;
