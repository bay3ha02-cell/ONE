// ==============================================
// gameController
// إنشاء لعبة، عرض الألعاب، عرض لعبة واحدة
// + endpoint توضيحي لمنطق التحقق من صلاحية الدخول إلى لعبة (مرتبط بنظام الشراء)
// ==============================================

const { Game, Category, Purchase } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// @desc    إنشاء لعبة جديدة
// @route   POST /api/games
// @access  خاص - Admin فقط
const createGame = asyncHandler(async (req, res) => {
  const { name, description, price, category, isFree, coverImage } = req.body;

  if (!name || !category) {
    res.status(400);
    throw new Error('اسم اللعبة والفئة مطلوبان');
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    throw new Error('الفئة المحددة غير موجودة');
  }

  const game = await Game.create({
    name,
    description,
    price,
    category,
    isFree,
    coverImage,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { game } });
});

// @desc    عرض كل الألعاب الفعّالة
// @route   GET /api/games
// @access  عام (Public)
const getGames = asyncHandler(async (req, res) => {
  const games = await Game.find({ isActive: true })
    .populate('category', 'name coverImage')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: games.length,
    data: { games },
  });
});

// @desc    عرض لعبة واحدة عبر المعرّف
// @route   GET /api/games/:id
// @access  عام (Public)
const getGameById = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id).populate('category', 'name coverImage');

  if (!game) {
    res.status(404);
    throw new Error('اللعبة غير موجودة');
  }

  res.status(200).json({ success: true, data: { game } });
});

// @desc    نقطة دخول توضيحية للعبة - تُطبّق منطق الوصول:
//          إذا لم يشتر المستخدم اللعبة (وهي غير مجانية) → 403 ممنوع
//          إذا اشتراها أو كانت مجانية → يُسمح بالدخول
//          هذا الـ endpoint جاهز ليُستبدل لاحقاً بمنطق بدء جلسة لعب فعلية (GameSession)
// @route   GET /api/games/:id/play
// @access  خاص (يتطلب تسجيل دخول)
const checkGameAccess = asyncHandler(async (req, res) => {
  const game = await Game.findById(req.params.id);

  if (!game) {
    res.status(404);
    throw new Error('اللعبة غير موجودة');
  }

  if (!game.isFree) {
    const owned = await Purchase.findOne({
      user: req.user._id,
      game: game._id,
      status: 'completed',
    });

    if (!owned) {
      res.status(403);
      throw new Error('يجب شراء هذه اللعبة أولاً للوصول إليها');
    }
  }

  res.status(200).json({
    success: true,
    message: 'تم منح صلاحية الدخول إلى اللعبة',
    data: { game },
  });
});

module.exports = { createGame, getGames, getGameById, checkGameAccess };
