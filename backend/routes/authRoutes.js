import express from 'express';
import { register, verifyEmail, login, me, updateProfile, changePassword } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Email/password authentication routes
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, me);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);

export default router;
