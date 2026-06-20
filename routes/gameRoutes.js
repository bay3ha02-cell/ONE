// ==============================================
// gameRoutes
// /api/games
// ==============================================

const express = require('express');
const { createGame, getGames, getGameById, checkGameAccess } = require('../controllers/gameController');
const { purchaseGame } = require('../controllers/purchaseController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').get(getGames).post(protect, adminOnly, createGame);

// ملاحظة ترتيب: /purchase ثابت ويجب أن يُعرَّف قبل /:id حتى لا يفسَّر "purchase" كمعرّف لعبة
router.post('/purchase', protect, purchaseGame);

router.get('/:id', getGameById);
router.get('/:id/play', protect, checkGameAccess);

module.exports = router;
