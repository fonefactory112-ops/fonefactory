import React from 'react';
import './LoadingSpinner.css';

export default function LoadingSpinner({ size = 'medium', fullPage = false }) {
  const spinner = (
    <div className={`spinner-container ${size}`}>
      <div className="spinner-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );

  if (fullPage) {
    return <div className="spinner-full-page">{spinner}</div>;
  }

  return spinner;
}
