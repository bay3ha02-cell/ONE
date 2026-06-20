// ==============================================
// generateToken
// ينشئ JWT موقّعاً يحمل معرّف المستخدم ودوره (role)
// يُستخدم بعد نجاح تسجيل الدخول أو إنشاء الحساب
// ==============================================

const jwt = require('jsonwebtoken');
const config = require('../config')

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

module.exports = generateToken;
