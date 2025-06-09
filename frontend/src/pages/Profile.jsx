import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/NavBar';
import '../styles/Profile.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { useParams } from 'react-router-dom';
import Search from '../components/Search';
import Toast from '../components/Toast';

// Separate EditModal into its own component
const EditModal = ({ updateData, setUpdateData, handleUpdate, error, onClose, userInfo }) => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('http://localhost:5000/api/auth/upload-avatar', 
        formData,
        {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update local state
      setUpdateData(prev => ({ 
        ...prev, 
        profilePicture: response.data.imageUrl 
      }));

      // Update token with new profile picture
      const currentToken = localStorage.getItem('token');
      const decoded = JSON.parse(atob(currentToken.split('.')[1]));
      const updatedUser = {
        ...decoded,
        profilePicture: response.data.imageUrl
      };

      // Get new token from backend with updated profile picture
      const tokenResponse = await axios.post('http://localhost:5000/api/auth/refresh-token',
        { user: updatedUser },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      // Update token in localStorage
      localStorage.setItem('token', tokenResponse.data.token);

      // Force reload to update all components
      window.location.reload();
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="modal-title">Edit Profile</h2>
        <div className="profile-picture-section">
          <Avatar 
            firstName={updateData.firstName}
            lastName={updateData.lastName}
            profilePicture={updateData.profilePicture}
            size="large"
          />
          <div className="upload-button-wrapper">
            <input
              type="file"
              id="profile-image"
              accept="image/*"
              onChange={handleImageUpload}
              className="file-input"
              disabled={uploadingImage}
            />
            <label htmlFor="profile-image" className={`upload-label ${uploadingImage ? 'uploading' : ''}`}>
              {uploadingImage ? 'Uploading...' : 'Change Profile Picture'}
            </label>
          </div>
        </div>
        <form onSubmit={handleUpdate} className="edit-form">
          <input
            type="text"
            className="edit-input"
            value={updateData.firstName}
            onChange={(e) => setUpdateData(prev => ({...prev, firstName: e.target.value}))}
            placeholder="First Name"
            required
          />
          <input
            type="text"
            className="edit-input"
            value={updateData.lastName}
            onChange={(e) => setUpdateData(prev => ({...prev, lastName: e.target.value}))}
            placeholder="Last Name"
            required
          />
          <textarea
            className="edit-input about-input"
            value={updateData.about}
            onChange={(e) => setUpdateData(prev => ({...prev, about: e.target.value}))}
            placeholder="About me"
            rows={4}
          />
          
          <button 
            type="button" 
            className="toggle-password-button"
            onClick={() => setShowPasswordFields(!showPasswordFields)}
          >
            {showPasswordFields ? 'Hide Password Fields' : 'Change Password'}
          </button>

          {showPasswordFields && (
            <>
              <input
                type="password"
                className="edit-input"
                value={updateData.currentPassword}
                onChange={(e) => setUpdateData(prev => ({...prev, currentPassword: e.target.value}))}
                placeholder="Current Password"
              />
              <input
                type="password"
                className="edit-input"
                value={updateData.newPassword}
                onChange={(e) => setUpdateData(prev => ({...prev, newPassword: e.target.value}))}
                placeholder="New Password"
              />
              <input
                type="password"
                className="edit-input"
                value={updateData.confirmNewPassword}
                onChange={(e) => setUpdateData(prev => ({...prev, confirmNewPassword: e.target.value}))}
                placeholder="Confirm New Password"
              />
            </>
          )}

          {error && <div className="error-message">{error}</div>}
          <div className="button-group">
            <button type="submit" className="save-button">Save Changes</button>
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function Profile() {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [updateData, setUpdateData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    about: '' // Add this field
  });
  const [error, setError] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // Add subscriberCount to the state
  const [subscriberCount, setSubscriberCount] = useState(0);
  // Add isSubscribed state after other state declarations
  const [isSubscribed, setIsSubscribed] = useState(false);
  // Add toast state after other state declarations
  const [toast, setToast] = useState({ show: false, message: '' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const fetchUserData = async () => {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentUser(decoded);

        // Always fetch complete user data from API
        const res = await axios.get(
          `http://localhost:5000/api/auth/profile/${userId || decoded.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const userData = res.data;
        setUserInfo(userData);
        
        // Update form data if viewing own profile
        if (!userId || userId === decoded.id) {
          setUpdateData(prev => ({
            ...prev,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            profilePicture: userData.profilePicture,
            about: userData.about || ''
          }));
        }

        // Set subscriber count
        setSubscriberCount(userData.subscribers?.length || 0);

        // Fetch user's posts
        const postsRes = await axios.get(
          `http://localhost:5000/api/posts/user/${userId || decoded.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserPosts(postsRes.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Add useEffect to fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!userId || !currentUser || userId === currentUser.id) return;
      
      try {
        const res = await axios.get(
          `http://localhost:5000/api/auth/subscribe/${userId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setIsSubscribed(res.data.isSubscribed);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      }
    };

    fetchSubscriptionStatus();
  }, [userId, currentUser]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');

    if (updateData.newPassword && updateData.newPassword !== updateData.confirmNewPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:5000/api/auth/update',
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        const decoded = JSON.parse(atob(res.data.token.split('.')[1]));
        setUserInfo(decoded);
        setIsEditing(false);
        setUpdateData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        }));
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'Update failed');
    }
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUserPosts(userPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  // Update the handleSubscribe function
  const handleSubscribe = async () => {
    if (!currentUser) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/subscribe/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setIsSubscribed(res.data.isSubscribed);
      setSubscriberCount(res.data.subscriberCount);
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

  if (isLoading) return <div>Loading...</div>;

  // Show edit button only if viewing own profile
  const isOwnProfile = currentUser && userId === currentUser.id;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-main-info">
              <Avatar 
                firstName={userInfo.firstName}
                lastName={userInfo.lastName}
                profilePicture={userInfo.profilePicture}
                size="large"
              />
              <div className="profile-info">
                <div className="profile-info-header">
                  <h2 className="user-name">{userInfo.firstName} {userInfo.lastName}</h2>
                  {isOwnProfile && (
                    <button 
                      className="settings-button"
                      onClick={() => setIsEditing(true)}
                      aria-label="Edit profile"
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
                        <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
                    </button>
                  )}
                </div>
                <p className="about-text">
                  {userInfo.about || "No description provided"}
                </p>
                <div className="profile-stats">
                  <p><strong>Email:</strong> {userInfo.email}</p>
                  <p className="subscriber-count">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stats-icon"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <strong>Plugged ins:</strong> {subscriberCount}
                  </p>
                  <p className="posts-count">
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="stats-icon"
                    >
                      <path d="M21 14h-7m-4 0H3"/>
                      <path d="M21 19h-7m-4 0H3"/>
                      <path d="M21 9h-7m-4 0H3"/>
                      <path d="M21 4h-7m-4 0H3"/>
                    </svg>
                    <strong>Posts:</strong> {userPosts.length}
                  </p>
                </div>
              </div>
            </div>
            {!isOwnProfile && (
              <button 
                className={`subscribe-button ${isSubscribed ? 'subscribed' : ''}`}
                onClick={handleSubscribe}
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
          </div>
        </div>

        <div className="user-posts">
          <div className="posts-header">
            <h2 className="posts-title">
              {isOwnProfile 
                ? "My Posts" 
                : `${userInfo.firstName}'s Posts`
              }
            </h2>
            <button 
              className="search-capsule"
              onClick={() => setIsSearchOpen(true)}
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search</span>
            </button>
          </div>
          {userPosts.map(post => (
            <PostCard
              key={post._id}
              post={{
                ...post,
                content: post.content // The content is already in HTML format from backend
              }}
              currentUser={userInfo}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
      {isEditing && (
        <EditModal
          updateData={updateData}
          setUpdateData={setUpdateData}
          handleUpdate={handleUpdate}
          error={error}
          onClose={() => setIsEditing(false)}
          userInfo={userInfo}
        />
      )}
      <Search 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        userId={userId} // Add this prop
      />
      {/* Add Toast component at the bottom of the JSX, before the closing tag */}
      {toast.show && (
        <Toast 
          message={toast.message}
          onClose={() => setToast({ show: false, message: '' })}
        />
      )}
    </>
  );
}

export default Profile;