// ==============================================
// ملف الإعدادات المركزية (Central Config)
// يجمع كل متغيرات البيئة في مكان واحد بدل نشر
// process.env في كل ملفات المشروع
// هذا يسهّل الصيانة: أي تعديل مستقبلي يتم من مكان واحد فقط
// ==============================================

require('dotenv').config();

const config = {
  // إعدادات الخادم
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  // إعدادات قاعدة البيانات
  mongoUri: process.env.MONGO_URI,

  // إعدادات JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // إعدادات Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  // رابط الواجهة الأمامية (يُستخدم في CORS)
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
};

// التحقق المبكر: إذا كانت متغيرات حساسة وأساسية مفقودة، نوقف التشغيل فوراً
// هذا أفضل بكثير من اكتشاف الخطأ لاحقاً أثناء تسجيل دخول مستخدم حقيقي
const requiredVariables = ['mongoUri', 'jwtSecret'];

requiredVariables.forEach((key) => {
  if (!config[key]) {
    console.error(`❌ متغير بيئة أساسي مفقود: ${key} — تحقق من ملف .env`);
    process.exit(1);
  }
});

module.exports = config;
