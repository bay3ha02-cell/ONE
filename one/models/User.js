// ==============================================
// نموذج المستخدم (User Model)
// يمثل أي شخص مسجّل في النظام: لاعب عادي (user) أو مسؤول (admin)
// ==============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: [2, 'الاسم قصير جداً'],
      maxlength: [50, 'الاسم طويل جداً'],
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true, // يضمن عدم تكرار البريد، وينشئ فهرساً (Index) يسرّع البحث عند تسجيل الدخول
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'صيغة البريد الإلكتروني غير صحيحة'],
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'],
      select: false, // لا تُرجع كلمة المرور تلقائياً في أي استعلام؛ يجب طلبها صراحة بـ .select('+password')
    },
    role: {
      type: String,
      enum: ['user', 'admin'], // user: لاعب عادي | admin: يدير الفئات والأسئلة
      default: 'user',
    },

    // ----- حقول الاشتراك والدفع (تُستخدم بالتفصيل في مرحلة Stripe) -----
    isSubscribed: {
      type: Boolean,
      default: false, // عند true يصبح بإمكان المستخدم الوصول لكل الفئات المدفوعة (Premium)
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true } // يضيف createdAt و updatedAt تلقائياً لكل مستخدم
);

// ----- Hook ما قبل الحفظ: تشفير كلمة المرور تلقائياً -----
// يعمل فقط إذا تم تعديل كلمة المرور فعلياً، حتى لا يُعاد تشفيرها عند مجرد تحديث الاسم مثلاً
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10); // 10 جولات تشفير: توازن جيد بين الأمان وسرعة الأداء
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ----- دالة مقارنة كلمة المرور (تُستخدم في تسجيل الدخول) -----
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// إزالة كلمة المرور تلقائياً من أي رد JSON، كطبقة حماية إضافية حتى لو نُسي select('-password')
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
