const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingredients.controller');

// GET /ingredients/list
router.get('/list', controller.getList);

module.exports = router;