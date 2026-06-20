// ==============================================
// userRoutes
// /api/users/my-games
// ==============================================

const express = require('express');
const { getMyGames } = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/my-games', protect, getMyGames);

module.exports = router;
