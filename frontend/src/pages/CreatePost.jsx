import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePost.css';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    navigate('/login');
    return;
  }

  const submitPost = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/posts', 
        { title, content },
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        }
      );
      navigate('/feed');
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err.message);
      alert('Failed to create post. Please make sure you are logged in.');
    }
  };

  return (
    <div className="create-post-container">
      <h2 className="create-post-title">Create New Post</h2>
      <input 
        className="create-post-input"
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        placeholder="Title" 
        required
      />
      <textarea 
        className="create-post-textarea"
        value={content} 
        onChange={e => setContent(e.target.value)} 
        placeholder="Content"
        required 
      />
      <button 
        className="create-post-button"
        onClick={submitPost}
      >
        Submit Post
      </button>
    </div>
  );
}

export default CreatePost;