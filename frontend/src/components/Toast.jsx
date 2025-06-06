import { useEffect } from 'react';
import '../styles/Toast.css';

function Toast({ message, type = 'success', onClose, duration = 2000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="toast-backdrop">
      <div className={`toast ${type}`}>
        <div className="toast-content">
          {type === 'success' && (
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17L4 12" />
            </svg>
          )}
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}

export default Toast;