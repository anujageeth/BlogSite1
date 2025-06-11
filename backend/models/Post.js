import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { 
    type: String, 
    required: true,
    set: function(content) {
      // First, convert markdown-style formatting to HTML
      let processedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/__(.*?)__/g, '<u>$1</u>');
      
      // Then convert URLs to clickable links
      // This regex matches URLs starting with http:// or https://
      const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;
      processedContent = processedContent.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
      
      // Also match URLs without protocol (www.example.com)
      const wwwRegex = /(?<!href=")(www\.[^\s<>"']+)/gi;
      processedContent = processedContent.replace(wwwRegex, '<a href="https://$1" target="_blank" rel="noopener noreferrer">$1</a>');
      
      return processedContent;
    }
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePicture: {
    type: String,
    default: ''
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  image: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('Post', postSchema);