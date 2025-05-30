import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  firstName: String,
  lastName: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Post", postSchema);
