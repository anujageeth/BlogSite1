import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/NavBar';
import PostCard from '../components/PostCard';
import '../styles/Feed.css';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

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
        const res = await axios.get('http://localhost:5000/api/posts');
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
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
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