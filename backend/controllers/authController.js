import User from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';
import asyncHandler from '../utils/asyncHandler.js';

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, and password are required' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  // All new registrations are regular users by default
  // Admin and instructors must be created by admin
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: 'user',
    isVerified: true
  });

  const response = {
    message: 'Registration successful. You can log in now.',
    userId: user._id,
    isVerified: user.isVerified
  };

  res.status(201).json(response);
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired verification token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ message: 'Email verified successfully' });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  // CRITICAL: Populate assignedCourses with basic course info
  const user = await User.findOne({ email: email.toLowerCase() })
    .populate({
      path: 'assignedCourses',
      select: 'title description category level isPublished'
    });
    
  if (!user || !(await user.matchPassword(password))) {
    console.log('❌ Login failed for:', email.toLowerCase());
    if (!user) console.log('   Reason: User not found');
    else console.log('   Reason: Password mismatch');
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated. Please contact an administrator.' });
  }

  const token = generateToken(user._id);
  
  console.log('\n========================================');
  console.log('🔐 User Login Successful');
  console.log('========================================');
  console.log('👤 User:', user.email);
  console.log('👤 Role:', user.role);
  console.log('📚 Assigned Courses:', user.assignedCourses?.length || 0);
  console.log('📚 Course IDs:', user.assignedCourses?.map(c => c._id.toString()));
  console.log('========================================\n');
  
  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      assignedCourses: user.assignedCourses // Now includes populated course data
    }
  });
});

const me = asyncHandler(async (req, res) => {
  // req.user is already populated from authMiddleware
  res.json({ user: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name } = req.body;
  if (name && name.trim()) {
    user.name = name.trim();
  }

  await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      assignedCourses: user.assignedCourses
    }
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Both current and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

export { register, verifyEmail, login, me, updateProfile, changePassword };
