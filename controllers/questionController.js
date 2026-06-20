// ==============================================
// questionController
// إضافة سؤال داخل فئة، وعرض أسئلة فئة معينة مرتبة حسب قوة السؤال
// ==============================================

const { Category, Question } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// @desc    إضافة سؤال داخل فئة معينة
// @route   POST /api/categories/:categoryId/questions
// @access  خاص - Admin فقط
const addQuestionToCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  // questionText هو الاسم المطلوب في مواصفات الـ API، ويُخزَّن داخلياً في حقل "text"
  // (الاسم الأصلي للحقل في الـ Model، لتفادي أي تعديل قد يكسر كوداً آخر يعتمد عليه)
  const {
    text,
    questionText,
    correctAnswer,
    hintAnswer,
    difficultyScore,
    options,
    type,
    difficulty,
    points,
  } = req.body;

  const finalText = questionText || text;

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error('الفئة غير موجودة');
  }

  if (!finalText || !correctAnswer) {
    res.status(400);
    throw new Error('نص السؤال (questionText) والإجابة الصحيحة (correctAnswer) مطلوبان');
  }

  const question = await Question.create({
    category: categoryId,
    text: finalText,
    correctAnswer,
    hintAnswer,
    difficultyScore,
    options,
    // افتراضياً "open" (سؤال وجواب مباشر) ما لم يُحدَّد نوع آخر صراحة،
    // لأن النوع الافتراضي في الـ Model هو "mcq" ويتطلب خيارين على الأقل
    type: type || 'open',
    difficulty,
    points,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { question } });
});

// @desc    عرض كل أسئلة فئة معينة، مرتبة تصاعدياً حسب قوة السؤال (difficultyScore)
// @route   GET /api/categories/:categoryId/questions
// @access  عام (Public) - الإجابة الصحيحة تبقى ظاهرة هنا حالياً؛ يُنصح بإخفائها عند بناء واجهة اللعب الفعلية
const getQuestionsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    res.status(404);
    throw new Error('الفئة غير موجودة');
  }

  const questions = await Question.find({ category: categoryId, isActive: true }).sort({
    difficultyScore: 1,
  });

  res.status(200).json({
    success: true,
    count: questions.length,
    data: { questions },
  });
});

module.exports = { addQuestionToCategory, getQuestionsByCategory };
