import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from './Avatar';
import '../styles/Search.css';

// Update the props to include userId
function Search({ isOpen, onClose, userId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [searchIn, setSearchIn] = useState('all');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update the useEffect with handleSearch function
  useEffect(() => {
    const handleSearch = async () => {
      if (searchTerm.trim()) {
        setIsLoading(true);
        try {
          const token = localStorage.getItem('token');
          const params = new URLSearchParams({
            q: searchTerm,
            searchIn,
            ...(dateRange.from && { from: dateRange.from }),
            ...(dateRange.to && { to: dateRange.to }),
            ...(userId && { userId })
          });

          const res = await axios.get(
            `http://localhost:5000/api/posts/search?${params}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (searchIn === 'users') {
            setSearchResults({ posts: [], users: res.data });
          } else {
            setSearchResults({ posts: res.data, users: [] });
          }
        } catch (err) {
          console.error('Search error:', err);
          setSearchResults({ posts: [], users: [] });
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults({ posts: [], users: [] });
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchIn, dateRange, userId]);

  const handleResultClick = (postId) => {
    navigate(`/post/${postId}`);
    onClose();
  };

  // Update the filter buttons to hide users option when userId is provided
  return (
    <>
      {isOpen && (
        <div className="search-overlay" onClick={onClose}>
          <div 
            className="search-container" 
            ref={searchRef}
            onClick={e => e.stopPropagation()}
          >
            <div className="search-header">
              <div className="search-input-wrapper">
                <svg 
                  className="search-icon"
                  viewBox="0 0 24 24" 
                  width="20" 
                  height="20"
                  fill="none" 
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  className="search-input"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="search-close" onClick={onClose}>
                ×
              </button>
            </div>

            <div className="search-filters">
              <div className="filter-group">
                <span className="filter-label">Search in:</span>
                <div className="filter-buttons">
                  <button 
                    className={`filter-button ${searchIn === 'all' ? 'active' : ''}`}
                    onClick={() => setSearchIn('all')}
                  >
                    Posts
                  </button>
                  <button 
                    className={`filter-button ${searchIn === 'title' ? 'active' : ''}`}
                    onClick={() => setSearchIn('title')}
                  >
                    Titles
                  </button>
                  <button 
                    className={`filter-button ${searchIn === 'content' ? 'active' : ''}`}
                    onClick={() => setSearchIn('content')}
                  >
                    Content
                  </button>
                  {/* Remove users button when userId is provided */}
                  {!userId && (
                    <button 
                      className={`filter-button ${searchIn === 'users' ? 'active' : ''}`}
                      onClick={() => setSearchIn('users')}
                    >
                      Users
                    </button>
                  )}
                </div>
              </div>
              
              {searchIn !== 'users' && (
                <div className="filter-group">
                  <span className="filter-label">Date range:</span>
                  <div className="date-inputs">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                      className="date-input"
                      max={dateRange.to || undefined}
                    />
                    <span className="date-separator">to</span>
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                      className="date-input"
                      min={dateRange.from || undefined}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="search-results">
              {isLoading ? (
                <div className="search-message">Searching...</div>
              ) : searchIn === 'users' && !userId ? (
                searchResults.users.length > 0 ? (
                  searchResults.users.map(user => (
                    <div 
                      key={user._id} 
                      className="search-result-item user-result"
                      onClick={() => {
                        navigate(`/profile/${user._id}`);
                        onClose();
                      }}
                    >
                      <div className="result-author">
                        <Avatar
                          firstName={user.firstName}
                          lastName={user.lastName}
                          profilePicture={user.profilePicture}
                          size="medium"
                        />
                        <div className="result-author-info">
                          <span className="author-name">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="user-email">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : searchTerm ? (
                  <div className="search-message">No users found</div>
                ) : (
                  <div className="search-message">Start typing to search users</div>
                )
              ) : (
                searchResults.posts.length > 0 ? (
                  searchResults.posts.map(post => (
                    <div 
                      key={post._id} 
                      className="search-result-item"
                      onClick={() => handleResultClick(post._id)}
                    >
                      <div className="result-author">
                        <Avatar
                          firstName={post.author?.firstName || post.firstName}
                          lastName={post.author?.lastName || post.lastName}
                          profilePicture={post.author?.profilePicture || post.profilePicture}
                          size="small"
                        />
                        <div className="result-author-info">
                          <span className="author-name">
                            {post.author?.firstName || post.firstName} {post.author?.lastName || post.lastName}
                          </span>
                          <span className="post-date">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <h3 className="result-title">{post.title}</h3>
                      <p className="result-preview">
                        {post.content?.substring(0, 100) || ''}...
                      </p>
                    </div>
                  ))
                ) : searchTerm ? (
                  <div className="search-message">No results found</div>
                ) : (
                  <div className="search-message">Start typing to search</div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Search;