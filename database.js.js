// ==============================================
// ملف الاتصال بقاعدة بيانات MongoDB
// مسؤوليته الوحيدة: فتح اتصال موثوق بقاعدة البيانات
// وإنهاء التطبيق بشكل آمن عند فشل الاتصال الأولي
// ==============================================

const mongoose = require('mongoose');
const config = require('./config');

// عدد محاولات إعادة الاتصال الأولي قبل الاستسلام نهائياً
// مفيد على Render حيث قد تحدث تأخيرات شبكية مؤقتة عند بدء التشغيل
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * دالة الاتصال بقاعدة البيانات
 * تُستدعى مرة واحدة فقط عند تشغيل الخادم (داخل server.js)
 * تُعيد المحاولة تلقائياً عدة مرات قبل إنهاء العملية
 */
const connectDatabase = async (attempt = 1) => {
  try {
    // رابط الاتصال يُقرأ من الإعدادات المركزية (config.js) - لا نكتبه مباشرة في الكود أبداً
    const connection = await mongoose.connect(config.mongoUri);

    console.log(`✅ تم الاتصال بقاعدة البيانات بنجاح: ${connection.connection.host}`);

    // الاستماع لأحداث الاتصال بعد نجاح الاتصال الأول (مفيد لمراقبة الانقطاعات)
    mongoose.connection.on('error', (error) => {
      console.error('❌ خطأ في اتصال قاعدة البيانات أثناء التشغيل:', error.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ تم فصل الاتصال بقاعدة البيانات');
    });
  } catch (error) {
    console.error(
      `❌ فشل الاتصال بقاعدة البيانات (محاولة ${attempt}/${MAX_RETRIES}):`,
      error.message
    );

    if (attempt < MAX_RETRIES) {
      await wait(RETRY_DELAY_MS);
      return connectDatabase(attempt + 1);
    }

    // إذا فشلت كل المحاولات، لا فائدة من تشغيل خادم بدون قاعدة بيانات
    console.error('❌ فشل الاتصال بقاعدة البيانات نهائياً بعد كل المحاولات.');
    process.exit(1); // إنهاء العملية برمز خطأ (1)
  }
};

module.exports = connectDatabase;
