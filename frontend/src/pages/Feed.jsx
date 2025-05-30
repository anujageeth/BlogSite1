import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Feed.css';
import Navbar from '../components/NavBar';

function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <>
      <Navbar />
      <div className="feed-container">
        <h2 className="feed-title">All Posts</h2>
        {posts.map(post => (
          <div key={post._id} className="post-card">
            <h3 className="post-title">{post.title}</h3>
            <p className="post-content">{post.content}</p>
            <div className="post-meta">
              Posted by {post.firstName} {post.lastName}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Feed;