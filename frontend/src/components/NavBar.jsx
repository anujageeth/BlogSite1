import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import '../styles/NavBar.css';

function Navbar() {
  const [userInfo, setUserInfo] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/feed" className="nav-link">Feed</Link>
        <Link to="/create" className="nav-link">Create Post</Link>
      </div>
      {userInfo ? (
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
                <span className="user-name">
                  {userInfo.firstName} {userInfo.lastName}
                </span>
                <span className="user-email">{userInfo.email}</span>
              </div>
            </div>
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">Profile</Link>
              <button onClick={logout} className="dropdown-item">Logout</button>
            </div>
          )}
        </div>
      ) : (
        <Link to="/login" className="nav-link">Login</Link>
      )}
    </nav>
  );
}

export default Navbar;