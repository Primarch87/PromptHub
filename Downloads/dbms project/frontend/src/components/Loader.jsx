import React from 'react';

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-ring">
        <svg
          className="loader-svg"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background track ring */}
          <circle
            className="loader-track"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="3"
          />
          {/* Spinning gradient arc */}
          <circle
            className="loader-arc"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="80 126"
          />
        </svg>
      </div>
      <span className="loader-label">Loading…</span>
    </div>
  );
};

export default Loader;
