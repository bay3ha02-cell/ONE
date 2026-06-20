// ==============================================
// Middleware معالجة الأخطاء
// أي خطأ يحدث في أي Controller (عبر next(error)) ينتهي به المطاف هنا
// هذا يمنع تكرار try/catch المعقد في كل مكان، ويوحّد شكل الرد على الأخطاء
// ==============================================

/**
 * middleware يُستدعى عندما لا يطابق الطلب أي مسار (Route) معرّف
 * يجب أن يكون آخر middleware يُضاف بعد كل الـ routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`المسار غير موجود: ${req.originalUrl}`);
  res.status(404);
  next(error); // تمرير الخطأ إلى معالج الأخطاء العام
};

/**
 * المعالج العام للأخطاء (Global Error Handler)
 * يجب أن يكون آخر middleware في كامل التطبيق (4 معاملات تحدد أنه error handler في Express)
 */
const errorHandler = (error, req, res, next) => {
  // أحياناً يصل الخطأ بحالة 200 رغم أنه خطأ فعلي، نصححها هنا
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // خطأ خاص بـ Mongoose عند إرسال معرّف (ID) غير صالح الصيغة
  let message = error.message;
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    message = 'المعرّف المُرسل غير صالح';
  }

  // خطأ تكرار قيمة فريدة (مثل بريد إلكتروني مسجل مسبقاً)
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    message = `القيمة المدخلة في حقل "${field}" مستخدمة مسبقاً`;
  }

  res.status(statusCode === 200 ? 400 : statusCode).json({
    success: false,
    message,
    // نُظهر تفاصيل الخطأ التقنية (stack) فقط في بيئة التطوير لأسباب أمنية
    stack: process.env.NODE_ENV === 'production' ? undefined : error.stack,
  });
};

module.exports = { notFound, errorHandler };
