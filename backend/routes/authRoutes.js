import express from 'express';
import { register, verifyEmail, login, me, updateProfile, changePassword, googleAuth } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Email/password & Google OAuth routes
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, me);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);

export default router;
