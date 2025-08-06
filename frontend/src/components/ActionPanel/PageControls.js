import React from 'react';

const PageControls = ({ currentPage, setCurrentPage }) => (
  <div className="page-controls">
    <div className="page-buttons">
      <button
        className={`page-button ${currentPage === 1 ? 'active' : ''}`}
        onClick={() => setCurrentPage(1)}
      >
        I
      </button>
      <button
        className={`page-button ${currentPage === 2 ? 'active' : ''}`}
        onClick={() => setCurrentPage(2)}
      >
        II
      </button>
    </div>
  </div>
);

export default PageControls;
