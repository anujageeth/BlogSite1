import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from './Avatar';
import Search from './Search';
import '../styles/NavBar.css';

function Navbar() {
  const [userInfo, setUserInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUserInfo(decoded);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update the fetchNotifications function
  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev//api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // The response now includes both notifications and unreadCount
      const { notifications, unreadCount } = res.data;
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Update the useEffect for notifications polling
  useEffect(() => {
    if (userInfo) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [userInfo]); // Add userInfo as dependency

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleNotificationClick = async () => {
    setIsNotificationOpen(!isNotificationOpen);
    if (unreadCount > 0) {
      try {
        await axios.put('https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev//api/notifications/read', {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setUnreadCount(0);
      } catch (err) {
        console.error('Error marking notifications as read:', err);
      }
    }
  };

  const handleNotificationItemClick = (notification) => {
    navigate(`/post/${notification.post._id}`);
    setIsNotificationOpen(false);
  };

  const handleBrandClick = (e) => {
    e.preventDefault();
    if (userInfo) {
      navigate('/feed');
    } else {
      navigate('/');
    }
  };

  return (
    <>
      {(isNotificationOpen || isDropdownOpen) && (
        <div className="backdrop-overlay" onClick={() => {
          setIsNotificationOpen(false);
          setIsDropdownOpen(false);
        }} />
      )}
      <nav className="navbar">
        <div className="nav-brand">
          <Link 
            to="#" 
            className="brand-link"
            onClick={handleBrandClick}
          >
            <img 
              src="/BlogSite1Logo2.png" 
              alt="BlogSpace" 
              className="brand-logo"
            />
          </Link>
        </div>
        {userInfo ? (
          <div className="nav-actions">
            <button 
              className="search-button"
              onClick={() => setIsSearchOpen(true)}
              data-tooltip="Search"
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
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
            
            <div className="notification-wrapper" ref={notificationRef}>
              <button 
                className="notification-button"
                onClick={handleNotificationClick}
                data-tooltip="Notifications"
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              {isNotificationOpen && (
                <div className={`notification-dropdown ${isNotificationOpen ? 'show' : ''}`}>
                  <h3 className="notification-header">Notifications</h3>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        // Only render notification if post exists
                        notification.post ? (
                          <div
                            key={notification._id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => handleNotificationItemClick(notification)}
                          >
                            <Avatar
                              firstName={notification.sender.firstName}
                              lastName={notification.sender.lastName}
                              profilePicture={notification.sender.profilePicture}
                              size="small"
                            />
                            <div className="notification-content">
                              <p>
                                <strong>{notification.sender.firstName} {notification.sender.lastName}</strong>
                                {notification.type === 'like' && ' liked your post '}
                                {notification.type === 'comment' && ' commented on your post '}
                                {notification.type === 'subscribe' && ' subscribed to your posts'}
                                {notification.type === 'post_created' && ' published a new post: '}
                                {notification.post && `"${notification.post.title}"`}
                              </p>
                              <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ) : null
                      ))
                    ) : (
                      <div className="no-notifications">
                        No notifications
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button 
              className="create-post-button welcome-create-button"
              onClick={() => navigate('/create')}
              data-tooltip="Create Post"
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
            </button>
            
            <div className="user-menu" ref={dropdownRef}>
              <div 
                className="user-info" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="user-info-content">
                  <Avatar 
                    firstName={userInfo.firstName}
                    lastName={userInfo.lastName}
                    profilePicture={userInfo.profilePicture}
                    size="small"
                  />
                  <div className="user-details">
                    <span className="user-name-card">
                      {userInfo.firstName} {userInfo.lastName}
                    </span>
                    <span className="user-email">{userInfo.email}</span>
                  </div>
                </div>
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link 
                    to={`/profile/${userInfo.id}`} 
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button onClick={logout} className="dropdown-item">Logout</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}
      </nav>
      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

export default Navbar;