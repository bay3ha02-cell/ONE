// ==============================================
// نقطة انطلاق التطبيق (Entry Point)
// مسؤوليته: تحميل الإعدادات، الاتصال بقاعدة البيانات،
// ثم تشغيل خادم HTTP والاستماع للطلبات
// ==============================================

const config = require('./config');
const connectDatabase = require('./database');
const app = require('./app');

// التقاط الأخطاء غير المتوقعة في الكود المتزامن (Synchronous) قبل أي شيء آخر
// مثال: استخدام متغير غير معرّف بالخطأ
process.on('uncaughtException', (error) => {
  console.error('❌ خطأ غير متوقع (Uncaught Exception):', error.message);
  process.exit(1);
});

/**
 * دالة تشغيل الخادم
 * نستخدم async/await لضمان نجاح الاتصال بقاعدة البيانات
 * قبل البدء باستقبال أي طلبات HTTP
 */
const startServer = async () => {
  // الخطوة 1: الاتصال بقاعدة البيانات أولاً
  await connectDatabase();

  // الخطوة 2: تشغيل خادم HTTP بعد التأكد من جاهزية قاعدة البيانات
  const server = app.listen(config.port, () => {
    console.log('==========================================');
    console.log(`🚀 الخادم يعمل الآن على المنفذ: ${config.port}`);
    console.log(`🌍 بيئة التشغيل: ${config.env}`);
    console.log(`🔗 رابط فحص الصحة: http://localhost:${config.port}/api/health`);
    console.log('==========================================');
  });

  // التقاط الأخطاء غير المتوقعة في الكود غير المتزامن (Promises)
  // مثال: فشل اتصال خارجي (Stripe, MongoDB) دون معالجة
  process.on('unhandledRejection', (error) => {
    console.error('❌ خطأ غير متوقع (Unhandled Rejection):', error.message);
    // إغلاق الخادم بأمان قبل إنهاء العملية، حتى لا تنقطع طلبات قيد المعالجة فجأة
    server.close(() => process.exit(1));
  });
};

startServer();
