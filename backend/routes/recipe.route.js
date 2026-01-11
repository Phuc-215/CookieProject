const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipe.controller');
const { requireAuth, requireVerifiedEmail } = require('../middlewares/auth.middleware');
// const { requireRole } = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');
const { CreateRecipeSchema, UpdateRecipeSchema } = require('../schemas/recipe');
const validation = require('../middlewares/schema.middleware');

router.get('/:id', controller.getDetail);

router.use(requireAuth, requireVerifiedEmail);
router.post('/save', validation(CreateRecipeSchema), upload.any(), controller.saveRecipe);
router.put('/:id', validation(UpdateRecipeSchema), controller.updateRecipe);
router.delete('/:id', controller.deleteRecipe);

module.exports = router;