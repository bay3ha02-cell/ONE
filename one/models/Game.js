// ==============================================
// نموذج اللعبة (Game Model)
// يمثل منتج لعبة قابل للعرض في المتجر، وقابل للشراء إذا لم يكن مجانياً
// منفصل عن GameSession: Game هو "المنتج" المعروض في المتجر،
// بينما GameSession هي "مباراة فعلية" تُلعب لاحقاً
// ==============================================

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم اللعبة مطلوب'],
      trim: true,
      maxlength: [80, 'اسم اللعبة طويل جداً'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'الوصف طويل جداً'],
      default: '',
    },
    // السعر بالوحدة الأساسية للعملة المستخدمة (مثلاً دولار). يُتجاهل فعلياً إذا كانت isFree = true
    price: {
      type: Number,
      default: 0,
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },
    // الفئة التي تنتمي إليها اللعبة (علاقة Many-to-One مع Category)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'يجب ربط اللعبة بفئة'],
    },
    // إذا كانت true، يمكن لأي مستخدم اللعب دون الحاجة لشراء فعلي
    isFree: {
      type: Boolean,
      default: false,
    },
    coverImage: {
      type: String,
      default: '',
    },
    // يسمح بإخفاء لعبة من المتجر دون حذفها فعلياً (مثلاً قيد المراجعة أو موقوفة مؤقتاً)
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // المسؤول (admin) الذي أنشأ هذه اللعبة
      required: true,
    },
  },
  { timestamps: true } // createdAt و updatedAt تلقائياً
);

// فهرس يسرّع جلب الألعاب الفعّالة ضمن فئة معينة (أكثر استعلام متكرر في المتجر)
gameSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Game', gameSchema);
