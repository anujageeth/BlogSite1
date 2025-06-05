import '../styles/ConfirmDialog.css';

function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button 
            className="confirm-button confirm-cancel" 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="confirm-button confirm-delete" 
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;