import Avatar from './Avatar';
import '../styles/Comment.css';

function Comment({ comment }) {
  return (
    <div className="comment">
      <div className="comment-header">
        <Avatar
          firstName={comment.firstName}
          lastName={comment.lastName}
          profilePicture={comment.profilePicture}
          size="small"
        />
        <div className="comment-info">
          <span className="comment-author">
            {comment.firstName} {comment.lastName}
          </span>
          <span className="comment-date">
            {new Date(comment.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>
      <p className="comment-content">{comment.content}</p>
    </div>
  );
}

export default Comment;