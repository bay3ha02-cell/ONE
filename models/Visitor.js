// ==============================================
// نموذج الزائر (Visitor Model)
// يسجّل كل طلب يصل للخادم لأغراض التحليلات الإدارية (Admin Analytics)
// التصميم مبسّط عمداً (بدون علاقات معقدة أو Validation ثقيل)
// لأن الكتابة فيه تحدث على كل طلب تقريباً، ويجب ألا تكلّف أداءً
// ==============================================

const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      default: 'unknown',
    },
    // الدولة المستخرجة من الـ IP عبر GeoIP محلي (بدون أي اتصال شبكي خارجي حفاظاً على الأداء)
    country: {
      type: String,
      default: 'Unknown',
      index: true, // يسرّع تجميع توزيع الدول في /api/admin/stats
    },
    path: {
      type: String,
      default: '',
    },
    method: {
      type: String,
      default: 'GET',
    },
    userAgent: {
      type: String,
      default: '',
    },
    // إن كان الطلب مصحوباً بتوكن JWT صالح، نربط الزيارة بالمستخدم (اختياري)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true } // createdAt = وقت الزيارة فعلياً
);

// فهرس يسرّع استعلامات لوحة التحكم (مثل "زيارات آخر 7 أيام")
visitorSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
