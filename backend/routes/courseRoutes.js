import express from 'express';
import {
  listCourses,
  getCourseById,
  searchCourses,
  createCourse,
  updateCourse,
  addReview,
  categories
} from '../controllers/courseController.js';
import { protect, optionalAuth, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, listCourses);
router.get('/search', optionalAuth, searchCourses);
router.get('/categories', categories);
router.get('/:id', protect, getCourseById);
router.post('/', protect, authorizeRoles('admin'), createCourse);
router.put('/:id', protect, authorizeRoles('admin'), updateCourse);
router.post('/:id/reviews', protect, authorizeRoles('user', 'student', 'admin'), addReview);

export default router;
