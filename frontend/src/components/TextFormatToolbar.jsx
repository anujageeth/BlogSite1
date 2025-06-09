import React from 'react';
import '../styles/TextFormatToolbar.css';

function TextFormatToolbar({ onFormat }) {
  const handleFormat = (style) => {
    onFormat(style);
  };

  return (
    <div className="format-toolbar">
      <button 
        type="button" 
        onClick={() => handleFormat('bold')}
        className="format-button"
        data-tooltip="Bold" // Add tooltip attribute
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>
      <button 
        type="button" 
        onClick={() => handleFormat('italic')}
        className="format-button"
        data-tooltip="Italic" // Add tooltip attribute
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>
      <button 
        type="button" 
        onClick={() => handleFormat('underline')}
        className="format-button"
        data-tooltip="Underline" // Add tooltip attribute
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
          <line x1="4" y1="21" x2="20" y2="21"></line>
        </svg>
      </button>
    </div>
  );
}

export default TextFormatToolbar;