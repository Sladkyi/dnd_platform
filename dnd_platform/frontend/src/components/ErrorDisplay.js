import React from 'react';

const ErrorDisplay = ({ error }) => (
  <div style={{ color: 'red', padding: '20px' }}>
    ⚠️ Ошибка: {error.message || 'Неизвестная ошибка'}
  </div>
);

export default ErrorDisplay;
