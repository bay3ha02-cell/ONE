// ==============================================
// questionRoutes
// مُركَّبة على /api/categories/:categoryId/questions (انظر app.js)
// mergeParams: true ضرورية حتى يصل req.params.categoryId من المسار الأب
// ==============================================

const express = require('express');
const {
  addQuestionToCategory,
  getQuestionsByCategory,
} = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getQuestionsByCategory)
  .post(protect, adminOnly, addQuestionToCategory);

module.exports = router;
