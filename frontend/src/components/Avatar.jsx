// filepath: c:\Personal\Projects\blog-site-1\frontend\src\components\Avatar.jsx
import '../styles/Avatar.css';

const Avatar = ({ firstName, lastName, profilePicture, size = 'medium' }) => {
  if (profilePicture) {
    return (
      <img 
        src={profilePicture} 
        alt="Profile" 
        className={`avatar-image ${size}`}
      />
    );
  }

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const colors = ['#FF8100', '#FF9500', '#FFB700'];
  const colorIndex = (firstName?.length + lastName?.length) % colors.length;

  return (
    <div 
      className={`avatar-initials ${size}`}
      style={{ backgroundColor: colors[colorIndex] }}
    >
      {initials}
    </div>
  );
};

export default Avatar;