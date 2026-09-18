import User from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';
import asyncHandler from '../utils/asyncHandler.js';

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Valid name, email, and password strings are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  // All new registrations are regular users by default
  // Admin and instructors must be created by admin
  const user = await User.create({
    name: cleanName,
    email: cleanEmail,
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
  if (!token || typeof token !== 'string') {
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
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'Valid email and password strings are required' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // CRITICAL: Populate assignedCourses with basic course info
  const user = await User.findOne({ email: cleanEmail })
    .populate({
      path: 'assignedCourses',
      select: 'title description category level isPublished'
    });
    
  if (!user || !(await user.matchPassword(password))) {
    console.log('❌ Login failed for:', cleanEmail);
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

const googleAuth = asyncHandler(async (req, res) => {
  const { credential, email, name, picture } = req.body;
  let userEmail = email;
  let userName = name;
  let userPicture = picture;

  // If JWT credential from Google Identity Services is provided, decode payload
  if (credential && typeof credential === 'string') {
    try {
      const parts = credential.split('.');
      if (parts.length >= 2) {
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        if (decoded.email) {
          userEmail = decoded.email;
          userName = decoded.name || userName || decoded.email.split('@')[0];
          userPicture = decoded.picture || userPicture;
        }
      }
    } catch (e) {
      console.warn('Could not decode Google credential JWT:', e);
    }
  }

  if (!userEmail || typeof userEmail !== 'string') {
    return res.status(400).json({ message: 'Google account email is required' });
  }

  const cleanEmail = userEmail.trim().toLowerCase();
  let user = await User.findOne({ email: cleanEmail }).populate({
    path: 'assignedCourses',
    select: 'title description category level isPublished'
  });

  if (!user) {
    // Automatically create account for Google user
    const randomPassword = 'G_' + Math.random().toString(36).slice(-8) + 'X9!';
    user = await User.create({
      name: userName || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: randomPassword,
      role: 'user',
      isVerified: true,
      isActive: true
    });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Your account has been deactivated. Please contact an administrator.' });
  }

  const token = generateToken(user._id);

  console.log('\n========================================');
  console.log('🌐 Google Authentication Successful');
  console.log('👤 User:', user.email);
  console.log('========================================\n');

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCourses: user.assignedCourses || [],
      completedCourses: user.completedCourses || []
    }
  });
});

export { register, verifyEmail, login, me, updateProfile, changePassword, googleAuth };
