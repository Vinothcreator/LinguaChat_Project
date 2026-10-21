import express from 'express';
import { register, login, signin, getProfile, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/signin', authRateLimiter, signin);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

export default router;
