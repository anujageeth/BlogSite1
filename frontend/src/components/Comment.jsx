import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from './Avatar';
import useClickOutside from '../hooks/useClickOutside';
import ConfirmDialog from './ConfirmDialog';
import '../styles/Comment.css';

function Comment({ comment, currentUser, postAuthor, onDelete }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const isOwner = currentUser && String(currentUser.id) === String(comment.author);
  const isPostOwner = currentUser && String(currentUser.id) === String(postAuthor);
  const canDelete = isOwner || isPostOwner;

  // Add useEffect to fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!comment?.author) return;
      
      try {
        const res = await axios.get(
          `https://elastic-tasteful-begonia.glitch.me/api/auth/profile/${comment.author}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setUserInfo(res.data);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    fetchUserInfo();
  }, [comment]);

  const handleDelete = async () => {
    try {
      await onDelete(comment._id);
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  const handleAuthorClick = () => {
    navigate(`/profile/${comment.author}`);
  };

  return (
    <>
      <div className="comment">
        <div className="comment-header">
          <div 
            className="comment-author-info"
            onClick={handleAuthorClick}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div className="post-author-tooltip">
              <strong>{comment.firstName} {comment.lastName}</strong>
              <span className="tooltip-plug-ins">
                {userInfo?.subscribers?.length || 0} Plug-ins
              </span>
            </div>
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