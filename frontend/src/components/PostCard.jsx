import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';
import useClickOutside from '../hooks/useClickOutside';
import ConfirmDialog from './ConfirmDialog';
import axios from 'axios';
import Toast from './Toast';

function PostCard({ post, currentUser, onDelete }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [userInfo, setUserInfo] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  // Update the fetchLikes function
  const fetchLikes = async () => {
    try {
      const res = await axios.get(
        `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${post._id}/likes`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      setLikeCount(res.data.likes);
      setIsLiked(res.data.isLiked);
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  // Add useEffect to fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!post?.author?._id || !currentUser) return;
      
      try {
        const res = await axios.get(
          `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/auth/subscribe/${post.author._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setIsSubscribed(res.data.isSubscribed);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      }
    };

    fetchSubscriptionStatus();
  }, [post, currentUser]);

  // Update useEffect to check for currentUser
  useEffect(() => {
    if (currentUser) {
      fetchLikes();
    }
  }, [post._id, currentUser]);

  // Add useEffect to fetch user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!post?.author?._id) return;
      
      try {
        const res = await axios.get(
          `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/auth/profile/${post.author._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setUserInfo(res.data);
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    fetchUserInfo();
  }, [post]);

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
      const res = await axios.put(  // Changed from post to put
        `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      // Update both isLiked and likeCount from response
      setIsLiked(res.data.likes.includes(currentUser.id));
      setLikeCount(res.data.likes.length);
    } catch (err) {
      console.error('Error updating like:', err);
    }
  };

  const handleCommentClick = (e) => {
    e.stopPropagation(); // Prevent triggering the post content click
    navigate(`/post/${post._id}#comment`);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    const authorId = post.author?._id || post.author;
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleSubscribe = async (e) => {
    e.stopPropagation(); // Prevent post click navigation
    
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.put(
        `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/auth/subscribe/${post.author._id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setIsSubscribed(res.data.isSubscribed);
      setToast({ 
        show: true, 
        message: res.data.isSubscribed ? 'Subscribed successfully!' : 'Unsubscribed successfully!' 
      });
    } catch (err) {
      console.error('Error updating subscription:', err);
      setToast({ 
        show: true, 
        message: err.response?.data?.msg || 'Error updating subscription' 
      });
    }
  };

  const isOwner = currentUser && (
    String(currentUser.id) === String(post.author?._id || post.author)
  );

  return (
    <>
      <div className="post-card">
        <div className="post-header">
          <div 
            className="post-author" 
            onClick={handleAuthorClick}
            style={{ cursor: 'pointer', position: 'relative' }}
          >
            <div className="post-author-tooltip">
              <strong>{post.author?.firstName || post.firstName} {post.author?.lastName || post.lastName}</strong>
              <span className="tooltip-plug-ins">
                {userInfo?.subscribers?.length || 0} Plug-ins
              </span>
              {/* {userInfo?.about && (
                <p className="tooltip-about">
                  {userInfo.about.length > 100 
                    ? userInfo.about.substring(0, 100) + '...' 
                    : userInfo.about
                  }
                </p>
              )} */}
            </div>
            <Avatar
              firstName={post.author?.firstName || post.firstName}
              lastName={post.author?.lastName || post.lastName}
              profilePicture={post.author?.profilePicture || post.profilePicture}
              size="small"
            />
            <div className="author-info">
              <span className="author-name">
                {post.author?.firstName || post.firstName} {post.author?.lastName || post.lastName}
              </span>
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="post-actions-group">
            {currentUser && currentUser.id !== post.author._id && (
              <button 
                className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribe}
                aria-label={isSubscribed ? 'Unsubscribe from author' : 'Subscribe to author'}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isSubscribed ? (
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="16"/>
                      <line x1="8" y1="12" x2="16" y2="12"/>
                    </>
                  )}
                </svg>
                <span>{isSubscribed ? 'Plugged in' : 'Plug in'}</span>
              </button>
            )}
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
                  aria-label="Post menu"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    width="24"
                    height="24"
                  >
                    <circle cx="12" cy="6" r="2.5" fill="currentColor"/>
                    <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
                    <circle cx="12" cy="18" r="2.5" fill="currentColor"/>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="post-dropdown">
                    {isOwner ? (
                      <>
                        <button
                          className="dropdown-item"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigate(`/edit-post/${post._id}`);
                          }}
                        >
                          <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="16"
                            height="16"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                          </svg>
                          Edit Post
                        </button>
                        <button
                          className="dropdown-item delete"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setShowConfirmDialog(true);
                          }}
                          disabled={isDeleting}
                        >
                          <svg 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="16"
                            height="16"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                          {isDeleting ? 'Deleting...' : 'Delete Post'}
                        </button>
                      </>
                    ) : (
                      <button className="dropdown-item report">
                        <svg 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          width="16"
                          height="16"
                        >
                          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                        Report Post
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="post-content-wrapper">
          <div 
            className="post-content-container"
            onClick={() => navigate(`/post/${post._id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="post-text">
              <h3 className="post-title">{post.title}</h3>
              <p 
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            {post.image && (
              <div className="post-thumbnail">
                <img 
                  src={post.image} 
                  alt={post.title}
                  loading="lazy"
                />
              </div>
            )}
          </div>
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
      {toast.show && (
        <Toast 
          message={toast.message}
          onClose={() => setToast({ show: false, message: '' })}
        />
      )}
    </>
  );
}

export default PostCard;