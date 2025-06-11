import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/NavBar';
import Avatar from '../components/Avatar';
import useClickOutside from '../hooks/useClickOutside';
import ConfirmDialog from '../components/ConfirmDialog';
import Comment from '../components/Comment';
import Toast from '../components/Toast';
import '../styles/PostDetail.css';

function PostDetail() {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const dropdownRef = useRef(null);
  const commentsRef = useRef(null);
  const commentInputRef = useRef(null);
  const { postId } = useParams();
  const navigate = useNavigate();

  useClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Set current user from token
    const decoded = JSON.parse(atob(token.split('.')[1]));
    setCurrentUser(decoded);

    const fetchPost = async () => {
      try {
        const res = await axios.get(`https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPost(res.data);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError(err.response?.data?.msg || 'Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!currentUser) return;
      
      try {
        const res = await axios.get(`https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${postId}/likes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setIsLiked(res.data.isLiked);
        setLikeCount(res.data.likes);
      } catch (err) {
        console.error('Error fetching likes:', err);
      }
    };

    if (post) {
      fetchLikes();
    }
  }, [post, currentUser, postId]);

  // Add this useEffect for fetching comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(
          `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${postId}/comments`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setComments(res.data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    if (post) {
      fetchComments();
    }
  }, [post, postId]);

  // Add this useEffect to fetch subscription status
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

  // Add after other useEffect hooks
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

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/feed');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.response?.data?.msg || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  // Update the handleLike function
  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.put(  // Change from post to put
        `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${postId}/like`,
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

  // Add comment handler
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await axios.post(
        `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${postId}/comments`,
        { content: commentInput },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setComments(prev => [res.data, ...prev]);
      setCommentInput('');
      setToast({ show: true, message: 'Comment posted successfully!' });
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(
        `https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Update comments list after deletion
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      // You might want to add error handling UI here
    }
  };

  // Add the handleSubscribe function
  const handleSubscribe = async () => {
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    // Scroll to comments if URL has #comments hash
    if (window.location.hash === '#comments' && commentsRef.current) {
      commentsRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [comments]); // Add comments as dependency to ensure section exists

  // Update this useEffect to handle comment input scrolling
  useEffect(() => {
    if (!post || !commentInputRef.current) return;

    const scrollToTarget = () => {
      if (window.location.hash === '#comment') {
        setTimeout(() => {
          commentInputRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
          commentInputRef.current?.focus();
        }, 100); // Small delay to ensure proper scrolling
      }
    };

    scrollToTarget();

    // Add event listener for browser back/forward navigation
    window.addEventListener('hashchange', scrollToTarget);
    return () => window.removeEventListener('hashchange', scrollToTarget);
  }, [post]);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="error-message">Post not found</div>;

  const isOwner = currentUser && (
    String(currentUser.id) === String(post.author?._id || post.author)
  );

  const handleAuthorClick = () => {
    // Fix: Use post.author._id or post.author if it's already a string
    const authorId = post.author._id || post.author;
    navigate(`/profile/${authorId}`);
  };

  // Add this function after other handler functions
  const handleCommentClick = () => {
    commentInputRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
    commentInputRef.current?.focus();
  };

  return (
    <>
      <Navbar />
      <div className="post-detail-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <svg 
            className="back-arrow" 
            width="18" 
            height="18" 
            viewBox="0 0 24 24"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M15 4L7 12L15 20" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back
        </button>
        <div className="post-detail-card">
          <div className="post-detail-header">
            <div 
              className="post-author" 
              onClick={handleAuthorClick}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div className="post-author-tooltip">
                <strong>{post.firstName} {post.lastName}</strong>
                <span className="tooltip-plug-ins">
                  {userInfo?.subscribers?.length || 0} Plug-ins
                </span>
              </div>
              <Avatar
                firstName={post.firstName}
                lastName={post.lastName}
                profilePicture={post.profilePicture}
                size="medium"
              />
              <div className="author-info">
                <span className="author-name">{post.firstName} {post.lastName}</span>
                <span className="post-date">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="post-actions-wrapper">
              <div className="interaction-buttons header-actions">
                {/* Existing comment button */}
                <button 
                  className="interaction-button"
                  onClick={handleCommentClick}
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

                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
                  </svg>
                  <span>{comments.length}</span>
                </button>

              </div>
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
          <h1 className="post-detail-title">{post.title}</h1>
          
          {/* Add image section */}
          {post.image && (
            <div className="post-image-container">
              <img 
                src={post.image} 
                alt={post.title}
                className="post-detail-image"
                loading="lazy"
              />
            </div>
          )}
          
          <p 
            className="post-detail-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          {/* Update the post-detail-footer section */}
          <div className="post-detail-footer">
            <div className="post-interactions">
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
                </div>
              <form className="comment-form" onSubmit={handleComment}>
                <input
                  ref={commentInputRef}
                  type="text"
                  className="comment-input"
                  placeholder="Write a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="comment-submit"
                  disabled={isSubmitting}
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
                </button>
              </form>
              
            </div>
          </div>
          {comments.length > 0 && (
            <div className="comments-section" ref={commentsRef}>
              <h3 className="comments-title">Comments ({comments.length})</h3>
              <div className="comments-list">
                {comments.map(comment => (
                  <Comment 
                    key={comment._id} 
                    comment={comment}
                    currentUser={currentUser}
                    postAuthor={post.author}
                    onDelete={handleDeleteComment}
                  />
                ))}
              </div>
            </div>
          )}
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

export default PostDetail;