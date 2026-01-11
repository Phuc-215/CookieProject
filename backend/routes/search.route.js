// routes/search.route.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/search.controller');
const authMiddleware = require('../middlewares/auth.middleware');
// Search Recipes


router.post('/', controller.search);

router.get('/suggestions', controller.getSuggestions);
router.use(authMiddleware.requireAuth);


router.get('/history', controller.getHistory);
router.delete('/history', controller.clearHistory);
router.delete('/history/:id', controller.deleteHistoryItem);

module.exports = router;