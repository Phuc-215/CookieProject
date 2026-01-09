// routes/search.route.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/search.controller');

// Search Recipes
router.post('/', controller.search);

router.get('/suggestions', controller.getSuggestions);

router.get('/history', controller.getHistory);
router.delete('/history', controller.clearHistory);

module.exports = router;