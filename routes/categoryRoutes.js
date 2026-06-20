// ==============================================
// categoryRoutes
// /api/categories
// ==============================================

const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
} = require('../controllers/categoryController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getCategories).post(protect, adminOnly, createCategory);

router.route('/:id').get(getCategoryById);

module.exports = router;
