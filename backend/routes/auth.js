import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';
import { authMiddleware } from '../middleware/auth.js';  // Add this import

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, dateOfBirth } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: "Email exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ 
    email, 
    password: hashed,
    firstName,
    lastName,
    dateOfBirth: new Date(dateOfBirth)
  });
  await user.save();
  res.status(201).json({ msg: "User created" });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "Invalid email" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Wrong password" });

  const token = jwt.sign({ 
    id: user._id, 
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profilePicture: user.profilePicture
  }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({ token });
});

router.put('/update', authMiddleware, async (req, res) => {
  const { firstName, lastName, email, currentPassword, newPassword, profilePicture } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

    // Check if name is being updated
    const isNameChanged = user.firstName !== firstName || user.lastName !== lastName;

    // Update user details
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    if (profilePicture) {
      user.profilePicture = profilePicture;
    }
    
    // Update password if provided
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // If name changed, update posts and comments
    if (isNameChanged) {
      // Update all posts by this user
      await Post.updateMany(
        { author: user._id },
        { 
          firstName: firstName,
          lastName: lastName,
          profilePicture: profilePicture || user.profilePicture
        }
      );

      // Update all comments by this user
      await Comment.updateMany(
        { author: user._id },
        { 
          firstName: firstName,
          lastName: lastName,
          profilePicture: profilePicture || user.profilePicture
        }
      );
    }

    // Generate new token with updated info
    const token = jwt.sign({ 
      id: user._id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture
    }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token, msg: "Profile updated successfully" });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user profile by ID
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password'); // Exclude password
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching user profile" });
  }
});

// Add this new route
router.post('/refresh-token', authMiddleware, async (req, res) => {
  try {
    const { user } = req.body;
    
    // Generate new token with updated user info
    const token = jwt.sign({ 
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePicture: user.profilePicture
    }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ msg: "Error refreshing token" });
  }
});

// Update the upload-avatar endpoint
router.post('/upload-avatar', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No image file provided" });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile_pictures',
      resource_type: 'auto'
    });

    // Handle notifications update with try-catch
    try {
      // Update user in database
      await User.findByIdAndUpdate(req.user.id, {
        profilePicture: uploadResponse.secure_url
      });

      // Update all posts
      await Post.updateMany(
        { author: req.user.id },
        { profilePicture: uploadResponse.secure_url }
      );

      // Update all comments
      await Comment.updateMany(
        { author: req.user.id },
        { profilePicture: uploadResponse.secure_url }
      );

      // Update all notifications (wrap in try-catch in case Notification collection doesn't exist)
      await Notification.updateMany(
        { 'sender._id': req.user.id },
        { 'sender.profilePicture': uploadResponse.secure_url }
      );

    } catch (updateErr) {
      console.error('Error updating references:', updateErr);
      // Continue execution even if updating references fails
    }

    res.json({ imageUrl: uploadResponse.secure_url });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ msg: "Error uploading avatar" });
  }
});

export default router;
