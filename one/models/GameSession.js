// ==============================================
// نموذج جلسة اللعب (GameSession Model)
// يمثل مباراة واحدة كاملة بين فريقين: من البداية حتى تحديد الفائز
// هذا هو النموذج الذي يربط كل شيء معاً (User + Category + Question)
// ==============================================

const mongoose = require('mongoose');

// ----- مخطط فرعي (Sub-document): الفريق -----
// كل جلسة لعب تحتوي بالضبط على فريقين، لذا نضمّن (Embed) بياناتهم داخل الجلسة نفسها
// بدل إنشاء Collection منفصلة لهم - هذا أسرع في القراءة (لا حاجة لـ populate إضافي)
// ولا معنى لوجود "فريق" مستقل خارج سياق جلسة لعب معينة
const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'اسم الفريق مطلوب'],
      trim: true,
      maxlength: [40, 'اسم الفريق طويل جداً'],
    },
    score: {
      type: Number,
      default: 0,
      min: [0, 'النقاط لا يمكن أن تكون سالبة'], // حماية أولية من قيم غير منطقية
    },
    // أعضاء الفريق (اختياري) - تسمح اللعبة بالعمل حتى دون حسابات مسجّلة لكل لاعب
    players: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { _id: true } // نُبقي _id لكل فريق لنميّز "الفريق الأول" عن "الثاني" بسهولة أثناء منطق اللعبة
);

// ----- مخطط فرعي: سجل سؤال داخل اللعبة -----
// نوثّق هنا كل سؤال طُرح خلال الجلسة: من أجاب عليه، هل كانت إجابته صحيحة، وكم نقطة حصل عليها
// هذا السجل ضروري لمنع الغش (سؤال لا يُطرح مرتين) ولعرض ملخص نهائي للمباراة
const questionLogSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    answeredByTeamId: {
      type: mongoose.Schema.Types.ObjectId, // يشير إلى _id أحد الفريقين داخل مصفوفة teams أعلاه
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: null, // null = لم تتم الإجابة بعد (السؤال ما زال معروضاً أو لم يُطرح)
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
    answeredAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const gameSessionSchema = new mongoose.Schema(
  {
    // منشئ/مضيف الجلسة - المستخدم الذي بدأ هذه اللعبة (علاقة Many-to-One مع User)
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'يجب تحديد منشئ الجلسة'],
    },

    // الفريقان المتنافسان - يجب أن يكونا فريقين بالضبط (تحقق مخصص بالأسفل)
    teams: {
      type: [teamSchema],
      validate: {
        validator: (teams) => teams.length === 2,
        message: 'يجب أن تحتوي الجلسة على فريقين بالضبط',
      },
    },

    // الفئات التي اختارها المضيف للعب فيها هذه الجلسة (علاقة Many-to-Many مع Category)
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
      },
    ],

    // سجل كامل بكل الأسئلة التي طُرحت خلال هذه الجلسة
    questionsLog: [questionLogSchema],

    // السؤال المعروض حالياً (إن وجد) - يسهّل معرفة "أين نحن الآن" في اللعبة
    currentQuestion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      default: null,
    },

    // فهرس الفريق صاحب الدور الحالي (0 يعني الفريق الأول، 1 يعني الثاني) - نظام الأدوار Turn-based
    currentTurnIndex: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },

    // حالة الجلسة
    status: {
      type: String,
      enum: ['waiting', 'in_progress', 'finished'], // قيد الانتظار | جارية | منتهية
      default: 'waiting',
    },

    // _id الفريق الفائز - يُحدد فقط عند انتهاء اللعبة (status = finished)
    winnerTeamId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    startedAt: { type: Date, default: null },
    endedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// فهرس يسرّع جلب "آخر جلسات لعب مستخدم معين" - مفيد لصفحة "سجل ألعابي"
gameSessionSchema.index({ host: 1, createdAt: -1 });

module.exports = mongoose.model('GameSession', gameSessionSchema);
