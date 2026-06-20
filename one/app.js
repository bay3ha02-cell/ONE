// ==============================================
// ملف تطبيق Express (app.js)
// مسؤوليته: تجهيز كائن Express وربط كل الـ middleware العام
// وربط الـ routes (سيتم إضافتها تباعاً في المراحل القادمة)
// فصل هذا الملف عن server.js يسهّل كتابة اختبارات (Tests) للتطبيق
// دون الحاجة لفتح اتصال حقيقي بالشبكة في كل مرة
// ==============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const config = require('./config')
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const trackVisitor = require('./middleware/visitorMiddleware');

// إنشاء تطبيق Express
const app = express();

// Render (وأي منصة استضافة مشابهة) تضع الخادم خلف Reverse Proxy واحد
// هذا الإعداد ضروري حتى يقرأ Express وحزمة express-rate-limit عنوان IP
// الحقيقي للعميل من رأس X-Forwarded-For بدلاً من عنوان الـ proxy نفسه
app.set('trust proxy', 1);

// ----- Middleware العام (يُطبّق على كل الطلبات) -----

// Helmet: يضيف رؤوس HTTP أمنية (Security Headers) لحماية التطبيق من ثغرات شائعة
app.use(helmet());

// CORS: السماح للواجهة الأمامية (Frontend) بالتواصل مع الـ API من نطاق مختلف
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Compression: ضغط الردود (Responses) لتسريع الاستجابة وتقليل استهلاك الشبكة
app.use(compression());

// Morgan: تسجيل (Logging) كل طلب HTTP في الـ console، مفيد جداً أثناء التطوير وتتبع الأخطاء
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// تمكين قراءة JSON من جسم الطلب (Body) مع حد أقصى لحجم البيانات (حماية من إغراق الخادم)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// تتبع الزوار (Analytics) - بدون أي تأثير على الأداء (Fire-and-forget، انظر visitorMiddleware.js)
app.use(trackVisitor);

// ----- مسار فحص صحة الخادم (Health Check) -----
// نسخة بسيطة بنص عادي (يُستخدم غالباً من أنظمة المراقبة الآلية مثل Render Health Checks)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ----- مسار فحص صحة الخادم (Health Check) -----
// مفيد جداً عند النشر (Render/Vercel/VPS) للتأكد أن الخادم يعمل
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'الخادم يعمل بنجاح ✅',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ----- ربط الـ Routes -----
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
// أسئلة كل فئة متداخلة تحت الفئة نفسها: /api/categories/:categoryId/questions
app.use('/api/categories/:categoryId/questions', require('./routes/questionRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// مثال لما سنضيفه لاحقاً:
// app.use('/api/payment', require('./routes/paymentRoutes'));

// ----- معالجة الأخطاء (يجب أن تبقى دائماً في آخر الملف) -----
app.use(notFound);
app.use(errorHandler);

module.exports = app;
