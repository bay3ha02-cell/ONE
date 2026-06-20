// ==============================================
// purchaseController
// شراء لعبة (أو المطالبة بلعبة مجانية)، وعرض ألعاب المستخدم
// ==============================================

const { Game, Purchase } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// @desc    شراء لعبة (أو تسجيل امتلاك لعبة مجانية)
// @route   POST /api/games/purchase
// @access  خاص (يتطلب تسجيل دخول)
const purchaseGame = asyncHandler(async (req, res) => {
  const { gameId } = req.body;

  if (!gameId) {
    res.status(400);
    throw new Error('معرّف اللعبة (gameId) مطلوب');
  }

  const game = await Game.findById(gameId);
  if (!game || !game.isActive) {
    res.status(404);
    throw new Error('اللعبة غير موجودة أو غير متاحة حالياً');
  }

  // التحقق إذا كان المستخدم يملك اللعبة مسبقاً
  const alreadyOwned = await Purchase.findOne({ user: req.user._id, game: game._id });
  if (alreadyOwned) {
    res.status(409);
    throw new Error('أنت تمتلك هذه اللعبة بالفعل');
  }

  // ملاحظة: عند تفعيل Stripe لاحقاً، الألعاب غير المجانية يجب أن تمر أولاً عبر
  // إنشاء جلسة دفع، ولا يُنشأ سجل الشراء هنا إلا بعد تأكيد الدفع عبر webhook.
  // حالياً (قبل تفعيل الدفع الحقيقي) نسجّل الشراء مباشرة لإبقاء النظام قابلاً للاختبار.
  const purchase = await Purchase.create({
    user: req.user._id,
    game: game._id,
    pricePaid: game.isFree ? 0 : game.price,
    status: 'completed',
  });

  res.status(201).json({
    success: true,
    message: game.isFree ? 'تم تفعيل اللعبة المجانية بنجاح' : 'تمت عملية الشراء بنجاح',
    data: { purchase },
  });
});

// @desc    عرض كل الألعاب التي يملكها المستخدم الحالي
// @route   GET /api/users/my-games
// @access  خاص (يتطلب تسجيل دخول)
const getMyGames = asyncHandler(async (req, res) => {
  const purchases = await Purchase.find({ user: req.user._id, status: 'completed' })
    .populate({
      path: 'game',
      populate: { path: 'category', select: 'name coverImage' },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: purchases.length,
    data: { games: purchases },
  });
});

module.exports = { purchaseGame, getMyGames };
