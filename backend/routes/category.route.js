const express = require('express');
const router = express.Router();
const controller = require('../controllers/category.controller');

router.get('/list', controller.getList);

module.exports = router;