// ==============================================
// categoryController
// إنشاء فئة جديدة، عرض كل الفئات، عرض فئة واحدة
// ==============================================

const { Category } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// @desc    إنشاء فئة جديدة
// @route   POST /api/categories
// @access  خاص - Admin فقط
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, coverImage, isPremium } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('اسم الفئة مطلوب');
  }

  const category = await Category.create({
    name,
    description,
    icon,
    coverImage,
    isPremium,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: { category } });
});

// @desc    عرض كل الفئات الفعّالة
// @route   GET /api/categories
// @access  عام (Public)
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: { categories },
  });
});

// @desc    عرض فئة واحدة عبر المعرّف
// @route   GET /api/categories/:id
// @access  عام (Public)
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('الفئة غير موجودة');
  }

  res.status(200).json({ success: true, data: { category } });
});

module.exports = { createCategory, getCategories, getCategoryById };
