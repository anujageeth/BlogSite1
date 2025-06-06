import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 });
    
    // Get comments count for each post
    const postsWithCounts = await Promise.all(posts.map(async post => {
      const commentsCount = await Comment.countDocuments({ post: post._id });
      return {
        ...post.toObject(),
        likes: post.likes?.length || 0,
        comments: commentsCount
      };
    }));
    
    res.json(postsWithCounts);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching posts" });
  }
});

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({
      title,
      content,
      author: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profilePicture: req.user.profilePicture
    });
    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ msg: "Error creating post" });
  }
});

// Get user's posts
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user posts" });
  }
});

// Get single post
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching post" });
  }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if user owns the post
    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ msg: "Error deleting post" });
  }
});

// Update post
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if user owns the post
    if (String(post.author) !== String(req.user.id)) {
      return res.status(403).json({ msg: "Not authorized to edit this post" });
    }

    const { title, content } = req.body;
    post.title = title;
    post.content = content;
    await post.save();

    res.json({ msg: "Post updated successfully", post });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ msg: "Error updating post" });
  }
});

// Like/Unlike post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const likeIndex = post.likes.indexOf(req.user.id);
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ 
      likes: post.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (err) {
    console.error('Like error:', err);
    res.status(500).json({ msg: "Error updating like" });
  }
});

// Get post likes
router.get('/:id/likes', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    const isLiked = post.likes.includes(req.user.id);
    res.json({
      likes: post.likes.length,
      isLiked
    });
  } catch (err) {
    res.status(500).json({ msg: "Error fetching likes" });
  }
});

// Get post comments
router.get('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching comments" });
  }
});

// Add comment
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = new Comment({
      content,
      post: req.params.id,
      author: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      profilePicture: req.user.profilePicture
    });
    
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ msg: "Error creating comment" });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    
    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    // Check if user owns the comment or the post
    const post = await Post.findById(req.params.postId);
    const isCommentOwner = String(comment.author) === String(req.user.id);
    const isPostOwner = String(post.author) === String(req.user.id);

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ msg: "Not authorized to delete this comment" });
    }

    await comment.deleteOne();
    res.json({ msg: "Comment deleted successfully" });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ msg: "Error deleting comment" });
  }
});

export default router;
