// ==============================================
// نموذج الشراء (Purchase Model)
// يمثل سجل امتلاك مستخدم للعبة معينة (سواء بالدفع أو بالحصول عليها مجاناً)
// هذا السجل هو مصدر الحقيقة الوحيد للإجابة على سؤال:
// "هل يملك هذا المستخدم صلاحية الدخول إلى هذه اللعبة؟"
// ==============================================

const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'يجب ربط عملية الشراء بمستخدم'],
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      required: [true, 'يجب ربط عملية الشراء بلعبة'],
    },
    // السعر الفعلي وقت الشراء (نسخة/Snapshot منفصلة عن سعر اللعبة الحالي،
    // حتى لو تغيّر سعر اللعبة لاحقاً يبقى سجل الشراء التاريخي صحيحاً)
    pricePaid: {
      type: Number,
      default: 0,
      min: [0, 'السعر المدفوع لا يمكن أن يكون سالباً'],
    },
    // حالة عملية الشراء - حالياً "completed" دائماً لأن الدفع الحقيقي (Stripe) لم يُفعّل بعد
    // جاهز لربطه لاحقاً بحالات: pending / completed / failed / refunded عند تفعيل الدفع الحقيقي
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'refunded'],
      default: 'completed',
    },
    // مرجع اختياري لمعرّف عملية الدفع الخارجية (Stripe payment intent) لربطها لاحقاً
    paymentReference: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// يمنع شراء نفس اللعبة أكثر من مرة لنفس المستخدم على مستوى قاعدة البيانات نفسها
// (طبقة حماية إضافية فوق التحقق الذي يتم في الـ controller)
purchaseSchema.index({ user: 1, game: 1 }, { unique: true });

module.exports = mongoose.model('Purchase', purchaseSchema);
