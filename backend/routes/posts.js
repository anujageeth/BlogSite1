import express from 'express';
import Post from '../models/Post.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

router.post('/', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  const post = new Post({ title, content, author: req.user.email, firstName: req.user.firstName, lastName: req.user.lastName });
  await post.save();
  res.status(201).json(post);
});

router.get('/user', authMiddleware, async (req, res) => {
  const posts = await Post.find({ author: req.user.email })
    .sort({ createdAt: -1 });
  res.json(posts);
});

export default router;
