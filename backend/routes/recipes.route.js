const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipes.controller');
const RecipeSchema = require('../schemas/recipe');
const validation = require('../middlewares/schema.middleware');

router.post('/create', validation(RecipeSchema), controller.create);

module.exports = router;