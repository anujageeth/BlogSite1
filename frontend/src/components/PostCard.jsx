import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import useClickOutside from '../hooks/useClickOutside';
import ConfirmDialog from './ConfirmDialog';
import axios from 'axios';

function PostCard({ post, currentUser, onDelete }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    const fetchLikes = async () => {
      if (!currentUser) return;
      
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${post._id}/likes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsLiked(res.data.isLiked);
        setLikeCount(res.data.likes);
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    };

    fetchLikes();
  }, [post._id, currentUser]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(post._id);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setIsLiked(res.data.isLiked);
      setLikeCount(res.data.likes);
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation(); // Prevent triggering the post content click
    navigate(`/post/${post._id}#comment`);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation(); // Prevent post content click
    // Fix: Use post.author._id or post.author if it's already a string
    const authorId = post.author._id || post.author;
    navigate(`/profile/${authorId}`);
  };

  const isOwner = String(currentUser?.id) === String(post.author);

  return (
    <>
      <div className="post-card">
        <div className="post-header">
          <div 
            className="post-author" 
            onClick={handleAuthorClick}
            style={{ cursor: 'pointer' }}
          >
            <Avatar
              firstName={post.firstName}
              lastName={post.lastName}
              profilePicture={post.profilePicture}
              size="small"
            />
            <div className="author-info">
              <span className="author-name">{post.firstName} {post.lastName}</span>
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="post-actions-group">
            <div className="interaction-buttons">
              <button 
                className={`interaction-button ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                    fill={isLiked ? "#ff8100" : "none"} 
                    stroke={isLiked ? "#ff8100" : "currentColor"}
                    strokeWidth="2"
                  />
                </svg>
                <span>{likeCount}</span>
              </button>
              <button 
                className="interaction-button"
                onClick={handleCommentClick}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{commentCount}</span>
              </button>
            </div>
            {currentUser && (
              <div className="post-actions" ref={dropdownRef}>
                <button
                  className="post-menu-button"
                  onClick={toggleDropdown}
                >
                  <span className="dots"></span>
                </button>
                {isDropdownOpen && (
                  <div className="post-dropdown">
                    {isOwner ? (
                      <>
                        <button
                          className="dropdown-item"
                          onClick={() => navigate(`/edit-post/${post._id}`)}
                        >
                          Edit Post
                        </button>
                        <button
                          className="dropdown-item delete"
                          onClick={() => setShowConfirmDialog(true)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Deleting...' : 'Delete Post'}
                        </button>
                      </>
                    ) : (
                      <button className="dropdown-item report">
                        Report Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div 
          className="post-content-wrapper"
          onClick={() => navigate(`/post/${post._id}`)}
          style={{ cursor: 'pointer' }}
        >
          <h3 className="post-title">{post.title}</h3>
          <p className="post-content">{post.content}</p>
        </div>
      </div>
      <ConfirmDialog
        isOpen={showConfirmDialog}
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={() => {
          handleDelete();
          setShowConfirmDialog(false);
        }}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </>
  );
}

export default PostCard;