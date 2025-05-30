import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from '../components/NavBar';
import '../styles/Profile.css';

// Separate EditModal into its own component
const EditModal = ({ updateData, setUpdateData, handleUpdate, error, onClose }) => (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h2 className="modal-title">Edit Profile</h2>
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
        <input
          type="email"
          className="edit-input"
          value={updateData.email}
          onChange={(e) => setUpdateData(prev => ({...prev, email: e.target.value}))}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="edit-input"
          value={updateData.currentPassword}
          onChange={(e) => setUpdateData(prev => ({...prev, currentPassword: e.target.value}))}
          placeholder="Current Password"
          required
        />
        <input
          type="password"
          className="edit-input"
          value={updateData.newPassword}
          onChange={(e) => setUpdateData(prev => ({...prev, newPassword: e.target.value}))}
          placeholder="New Password (optional)"
        />
        <input
          type="password"
          className="edit-input"
          value={updateData.confirmNewPassword}
          onChange={(e) => setUpdateData(prev => ({...prev, confirmNewPassword: e.target.value}))}
          placeholder="Confirm New Password"
        />
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

function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [updateData, setUpdateData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');

  const fetchUserData = useCallback(async (token) => {
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserInfo(decoded);
      setUpdateData(prev => ({
        ...prev,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.email
      }));

      const res = await axios.get('http://localhost:5000/api/posts/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserPosts(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchUserData(token);
  }, [fetchUserData]);

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="profile-container">
        <div className="profile-header">
          <h2 className="profile-title">Profile</h2>
          <div className="profile-info">
            <p><strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
          </div>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>

        <div className="profile-posts">
          <h3 className="posts-title">My Posts</h3>
          {userPosts.map(post => (
            <div key={post._id} className="post-card">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-content">{post.content}</p>
              <div className="post-meta">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
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
        />
      )}
    </>
  );
}

export default Profile;