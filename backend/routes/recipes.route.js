const express = require('express');
const router = express.Router();
const controller = require('../controllers/recipes.controller');
const authMiddleware = require('../middlewares/auth.middleware');
// Middleware for authentication (placeholder name)

// Like
router.use(authMiddleware.requireAuth);

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