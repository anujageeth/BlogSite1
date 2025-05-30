import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';  // Fix the import path

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
    lastName: user.lastName
  }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });

  res.json({ token });
});

router.put('/update', authMiddleware, async (req, res) => {
  const { firstName, lastName, email, currentPassword, newPassword } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

    // Update user details
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    
    // Update password if provided
    if (newPassword) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    // Generate new token with updated info
    const token = jwt.sign({ 
      id: user._id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({ token, msg: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
