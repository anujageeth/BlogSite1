import { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/CreatePost.css';
import Toast from '../components/Toast';
import Navbar from '../components/NavBar';  // Add this import
import TextFormatToolbar from '../components/TextFormatToolbar';

const wrapText = (text, selectionStart, selectionEnd, wrapper) => {
  const before = text.substring(0, selectionStart);
  const selected = text.substring(selectionStart, selectionEnd);
  const after = text.substring(selectionEnd);
  return {
    text: before + wrapper[0] + selected + wrapper[1] + after,
    newPosition: selectionEnd + wrapper[0].length + wrapper[1].length
  };
};

function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [isImproving, setIsImproving] = useState(false);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

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

  // Update the submitPost function
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

      const response = await axios.post('https://elastic-tasteful-begonia.glitch.me/api/posts', formData, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setToast({ show: true, message: 'Post created successfully!' });
      setTimeout(() => {
        navigate(`/post/${response.data._id}`); // Navigate to the new post
      }, 1000);
    } catch (err) {
      console.error('Error creating post:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add the improve content function
  const improveContent = async () => {
    if (!content.trim()) {
      setToast({ show: true, message: 'Please add some content to improve' });
      return;
    }

    setIsImproving(true);
    try {
      const response = await axios.post(
        'https://elastic-tasteful-begonia.glitch.me/api/ai/improve-content',
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

  // Update the handleFormat function
  const handleFormat = (style) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const scrollTop = textarea.scrollTop; // Store scroll position

    let wrapper;
    switch (style) {
      case 'bold':
        wrapper = ['**', '**'];
        break;
      case 'italic':
        wrapper = ['*', '*'];
        break;
      case 'underline':
        wrapper = ['__', '__'];
        break;
      default:
        return;
    }

    const { text, newPosition } = wrapText(content, start, end, wrapper);
    setContent(text);

    // Restore focus, selection, and scroll position after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + wrapper[0].length,
        end + wrapper[0].length
      );
      textarea.scrollTop = scrollTop; // Restore scroll position
    }, 0);
  };

  return (
    <>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>

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

        <div className="create-post-container">
          
          <h2 className="create-post-title">Create New Post</h2>
          <input 
            className="create-post-input"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Title" 
            required
          />
          <div className="content-area">
            <TextFormatToolbar onFormat={handleFormat} />
            <textarea 
              ref={textareaRef}
              className="create-post-textarea"
              value={content} 
              onChange={e => setContent(e.target.value)} 
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
          <button 
            className="create-post-button"
            onClick={submitPost}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Submit Post'}
          </button>
        </div>

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

export default CreatePost;