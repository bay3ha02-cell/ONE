// ==============================================
// Middleware المصادقة والصلاحيات (Auth Middleware)
// protect: يتحقق من وجود JWT صالح ويربط المستخدم بـ req.user
// adminOnly: يجب استخدامه بعد protect، يسمح فقط لمن role = 'admin'
// ==============================================

const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

/**
 * يتحقق من رأس Authorization بصيغة: "Bearer <token>"
 * عند النجاح، يضيف req.user (بدون كلمة المرور) ليستخدمه أي controller لاحق
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('غير مصرح بالدخول: التوكن مفقود');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('غير مصرح بالدخول: المستخدم غير موجود');
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('غير مصرح بالدخول: توكن غير صالح أو منتهي الصلاحية');
  }
});

/**
 * يجب استخدامه بعد protect دائماً
 * يسمح بالمرور فقط إذا كان req.user.role === 'admin'
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('هذا الإجراء متاح فقط للمسؤولين (Admin)');
};

module.exports = { protect, adminOnly };
