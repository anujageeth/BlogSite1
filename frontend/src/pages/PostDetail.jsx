import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/NavBar';
import Avatar from '../components/Avatar';
import useClickOutside from '../hooks/useClickOutside';
import ConfirmDialog from '../components/ConfirmDialog';
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
  const dropdownRef = useRef(null);
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!post) return <div className="error-message">Post not found</div>;

  const isOwner = currentUser && String(currentUser.id) === String(post.author);

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
            <div className="post-author">
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
                >
                  <span className="dots"></span>
                </button>
                {isDropdownOpen && (
                  <div className="post-dropdown">
                    <button
                      className="dropdown-item"
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                    >
                      Edit Post
                    </button>
                    <button
                      className="dropdown-item delete"
                      onClick={() => setShowConfirmDialog(true)}
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <h1 className="post-detail-title">{post.title}</h1>
          <p className="post-detail-content">{post.content}</p>
          
          {/* Add interaction buttons */}
          <div className="post-detail-footer">
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
    </>
  );
}

export default PostDetail;