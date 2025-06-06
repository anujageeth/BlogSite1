import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePost.css';

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    navigate('/login');
    return;
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }
      setImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitPost = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/feed');
    } catch (err) {
      console.error('Error creating post:', err.response?.data || err.message);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
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
      <div className="image-upload-container">
        <input
          type="file"
          id="image-upload"
          className="image-upload-input"
          accept="image/*"
          onChange={handleImageChange}
        />
        <label htmlFor="image-upload" className="image-upload-label">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <line x1="16" y1="5" x2="22" y2="5" />
            <line x1="19" y1="2" x2="19" y2="8" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          Add Image
        </label>
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button 
              className="remove-image-button"
              onClick={() => {
                setImage(null);
                setImagePreview('');
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>
      <button 
        className="create-post-button"
        onClick={submitPost}
        disabled={isLoading}
      >
        {isLoading ? 'Creating...' : 'Submit Post'}
      </button>
    </div>
  );
}

export default CreatePost;