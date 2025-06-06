import { useState, useRef } from 'react';
import Avatar from './Avatar';
import useClickOutside from '../hooks/useClickOutside';
import ConfirmDialog from './ConfirmDialog';
import '../styles/Comment.css';

function Comment({ comment, currentUser, postAuthor, onDelete }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const dropdownRef = useRef(null);

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const isOwner = currentUser && String(currentUser.id) === String(comment.author);
  const isPostOwner = currentUser && String(currentUser.id) === String(postAuthor);
  const canDelete = isOwner || isPostOwner;

  const handleDelete = async () => {
    try {
      await onDelete(comment._id);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <>
      <div className="comment">
        <div className="comment-header">
          <div className="comment-author-info">
            <Avatar
              firstName={comment.firstName}
              lastName={comment.lastName}
              profilePicture={comment.profilePicture}
              size="small"
            />
            <div className="comment-info">
              <span className="comment-author">
                {comment.firstName} {comment.lastName}
              </span>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div className="comment-actions" ref={dropdownRef}>
            <button 
              className="comment-menu-button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="dots"></span>
            </button>
            {isDropdownOpen && (
              <div className="comment-dropdown">
                {canDelete ? (
                  <button
                    className="dropdown-item delete"
                    onClick={() => setShowConfirmDialog(true)}
                  >
                    Delete Comment
                  </button>
                ) : (
                  <button className="dropdown-item report">
                    Report Comment
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="comment-content">{comment.content}</p>
      </div>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        message="Are you sure you want to delete this comment?"
        onConfirm={() => {
          handleDelete();
          setShowConfirmDialog(false);
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}

export default Comment;