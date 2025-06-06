import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/NavBar';
import '../styles/CreatePost.css';
import Toast from '../components/Toast';

function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isImproving, setIsImproving] = useState(false);
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTitle(res.data.title);
        setContent(res.data.content);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ show: true, message: 'File size should be less than 5MB' });
        return;
      }
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const improveContent = async () => {
    if (!content.trim()) {
      setToast({ show: true, message: 'Please add some content to improve' });
      return;
    }

    setIsImproving(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/ai/improve-content',
        { content },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      setContent(response.data.improvedContent);
      setToast({ show: true, message: 'Content improved successfully!' });
    } catch (err) {
      console.error('Error improving content:', err);
      setToast({ show: true, message: 'Failed to improve content. Please try again.' });
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      await axios.put(
        `http://localhost:5000/api/posts/${postId}`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      setToast({ show: true, message: 'Post updated successfully!' });
      setTimeout(() => {
        navigate(`/post/${postId}`);
      }, 1000);
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err.response?.data?.msg || 'Failed to update post');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="create-post-container">
        <h2 className="create-post-title">Edit Post</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="create-post-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
          />
          <div className="content-area">
            <textarea
              className="create-post-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              required
            />
            <div className="buttons-row">
              <div className="image-upload-container">
                {!imagePreview ? (
                  <>
                    <input
                      type="file"
                      id="image-upload"
                      className="image-upload-input"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <label htmlFor="image-upload" className="image-upload-label">
                      <svg 
                        className="add-image-icon"
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
                  </>
                ) : (
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
                className="improve-button-bottom"
                onClick={improveContent}
                disabled={isImproving || !content.trim()}
              >
                {isImproving ? (
                  <>
                    <span className="spinner"></span>
                    Improving...
                  </>
                ) : (
                  <>
                    <svg 
                      className="improve-icon"
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Improve Content
                  </>
                )}
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="create-post-button">
              Save Changes
            </button>
            <button
              type="button"
              className="create-post-button"
              onClick={() => navigate(-1)}
              style={{ backgroundColor: '#666' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
      {toast.show && (
        <Toast 
          message={toast.message}
          onClose={() => setToast({ show: false, message: '' })}
        />
      )}
    </>
  );
}

export default EditPost;