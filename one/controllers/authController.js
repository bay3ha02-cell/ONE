// ==============================================
// authController
// تسجيل حساب جديد، تسجيل الدخول، وجلب بيانات المستخدم الحالي
// ==============================================

const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

// @desc    إنشاء حساب جديد
// @route   POST /api/auth/register
// @access  عام (Public)
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('الاسم والبريد الإلكتروني وكلمة المرور كلها مطلوبة');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409);
    throw new Error('هذا البريد الإلكتروني مسجّل مسبقاً');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الحساب بنجاح',
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user),
    },
  });
});

// @desc    تسجيل الدخول
// @route   POST /api/auth/login
// @access  عام (Public)
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان');
  }

  // password حقله select:false افتراضياً في النموذج، لذا نطلبه صراحة هنا فقط
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  res.status(200).json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح',
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user),
    },
  });
});

// @desc    جلب بيانات المستخدم المسجّل دخوله حالياً
// @route   GET /api/auth/me
// @access  خاص (يتطلب تسجيل دخول)
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
});

module.exports = { register, login, getMe };
