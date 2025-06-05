import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar';

function PostCard({ post, currentUser, onDelete }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(post._id);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = String(currentUser?.id) === String(post.author);

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <Avatar
            firstName={post.firstName}
            lastName={post.lastName}
            profilePicture={post.profilePicture}
            size="small"
          />
          <div className="author-info">
            <span className="author-name">{post.firstName} {post.lastName}</span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {currentUser && (
          <div className="post-actions">
            <button
              className="post-menu-button"
              onClick={toggleDropdown}
            >
              <span className="dots"></span>
            </button>
            {isDropdownOpen && (
              <div className="post-dropdown">
                {isOwner ? (
                  <>
                    <button
                      className="dropdown-item"
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                    >
                      Edit Post
                    </button>
                    <button
                      className="dropdown-item delete"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                  </>
                ) : (
                  <button
                    className="dropdown-item report"
                    onClick={() => console.log('Report:', post._id)}
                  >
                    Report Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <h3 className="post-title">{post.title}</h3>
      <p className="post-content">{post.content}</p>
    </div>
  );
}

export default PostCard;