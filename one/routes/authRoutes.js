// ==============================================
// authRoutes
// /api/auth/register | /api/auth/login | /api/auth/me
// ==============================================

const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// حماية من محاولات تخمين كلمات المرور (Brute-force) على تسجيل الدخول والتسجيل
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 20, // 20 محاولة كحد أقصى لكل IP خلال النافذة الزمنية
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'محاولات كثيرة جداً، حاول لاحقاً' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);

module.exports = router;
