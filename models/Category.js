// ==============================================
// نموذج الفئة (Category Model)
// مثال: "رياضة"، "تاريخ"، "علوم"، "ثقافة عامة"
// كل فئة تحتوي لاحقاً على مجموعة أسئلة (علاقة One-to-Many مع Question)
// ==============================================

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم الفئة مطلوب'],
      unique: true, // لا يمكن تكرار نفس اسم الفئة
      trim: true,
      maxlength: [60, 'اسم الفئة طويل جداً'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'الوصف طويل جداً'],
      default: '',
    },
    icon: {
      type: String, // رابط صورة أو اسم أيقونة تُعرض في الواجهة الأمامية
      default: '',
    },
    // صورة الغلاف الرئيسية للفئة (مطلوبة لعرض بطاقات الفئات في الواجهة الأمامية)
    // منفصلة عن icon: icon لأيقونة صغيرة، coverImage لصورة غلاف كاملة
    coverImage: {
      type: String,
      default: '',
    },
    // إذا كانت true، يجب أن يكون المستخدم مشتركاً (isSubscribed = true) ليتمكن من اللعب بها
    isPremium: {
      type: Boolean,
      default: false,
    },
    // يسمح بإخفاء فئة مؤقتاً (مثلاً قيد المراجعة) دون حذفها فعلياً من قاعدة البيانات
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // المسؤول (admin) الذي أنشأ هذه الفئة
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
