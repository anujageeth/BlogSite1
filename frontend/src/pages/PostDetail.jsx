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
        const res = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
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
        const res = await axios.get(`http://localhost:5000/api/posts/${postId}/likes`, {
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
          `http://localhost:5000/api/posts/${postId}/comments`,
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

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      navigate('/feed');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err.response?.data?.msg || 'Failed to delete post');
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5000/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setIsLiked(res.data.isLiked);
      setLikeCount(res.data.likes);
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
        `http://localhost:5000/api/posts/${postId}/comments`,
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
        `http://localhost:5000/api/posts/${postId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      // Update comments list after deletion
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      // You might want to add error handling UI here
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

  const isOwner = currentUser && String(currentUser.id) === String(post.author);

  const handleAuthorClick = () => {
    // Fix: Use post.author._id or post.author if it's already a string
    const authorId = post.author._id || post.author;
    navigate(`/profile/${authorId}`);
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
              style={{ cursor: 'pointer' }}
            >
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
            {isOwner && (
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
                    fill="currentColor"
                  >
                    <circle cx="12" cy="6" r="2.5"/>
                    <circle cx="12" cy="12" r="2.5"/>
                    <circle cx="12" cy="18" r="2.5"/>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="post-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => navigate(`/edit-post/${post._id}`)}
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
                      onClick={() => setShowConfirmDialog(true)}
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
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
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
          
          <p className="post-detail-content">{post.content}</p>
          
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
        <div className="toast-container">
          <Toast 
            message={toast.message}
            onClose={() => setToast({ show: false, message: '' })}
          />
        </div>
      )}
    </>
  );
}

export default PostDetail;