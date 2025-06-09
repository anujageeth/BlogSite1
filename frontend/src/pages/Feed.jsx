import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/NavBar';
import PostCard from '../components/PostCard';
import '../styles/Feed.css';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded token:', decoded); // Debug log
        setCurrentUser(decoded);
      } catch (err) {
        console.error('Error decoding token:', err);
      }
    }

    const fetchPosts = async () => {
      try {
        const res = await axios.get('https://elastic-tasteful-begonia.glitch.me/api/posts');
        console.log('Fetched posts:', res.data); // Debug log
        setPosts(res.data);
      } catch (err) {
        console.error('Error fetching posts:', err);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`https://elastic-tasteful-begonia.glitch.me/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="feed-container">
        {currentUser && (
          <div className="welcome-box">
            <div className="welcome-content">
              <h2>Welcome, {currentUser.firstName}!</h2>
              <p>Share your thoughts with the community</p>
            </div>
            <button 
              className="welcome-create-button"
              onClick={() => navigate('/create')}
            >
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
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Post
            </button>
          </div>
        )}
        {posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </>
  );
}

export default Feed;