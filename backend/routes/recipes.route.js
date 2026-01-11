const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipes.controller');
const { requireAuth, requireVerifiedEmail } = require('../middlewares/auth.middleware');
const { upload } = require('../middlewares/upload.middleware');
const { RecipeSchema } = require('../validations/recipe.validation');
const { validate } = require('../middlewares/validate.middleware');

router.get('/:id', controller.getDetail);
router.use(requireAuth, requireVerifiedEmail);

// Publish recipe
router.post('/create', upload.any(), validate(RecipeSchema), controller.saveRecipe);

// Save as draft
router.put('/save', upload.any(), controller.saveRecipe);

// Update recipe
router.patch('/:id', upload.any(), validate(RecipeSchema), controller.saveRecipe);

// Delete
router.delete('/:id', controller.deleteRecipe);

// Like
router.post('/:id/like', controller.likeRecipe);

// Unlike
router.delete('/:id/like', controller.unlikeRecipe);

// Add Comment
router.post('/:id/comments', controller.addComment);

// Get Comments
router.get('/:id/comments', controller.getComments);

// Delete Comment
router.delete('/:id/comments/:commentId', controller.deleteComment);

module.exports = router;