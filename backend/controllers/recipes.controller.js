const recipesService = require('../services/recipes.service');

exports.likeRecipe = async (req, res) => {
    try {
        // req.user is set by auth middleware
        const userId = req.user.id; 
        const recipeId = parseInt(req.params.id, 10);
        
        await recipesService.likeRecipe(userId, recipeId);
        res.status(200).json({ message: 'Recipe liked' });
    } catch (err) {
        console.error('Like Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.unlikeRecipe = async (req, res) => {
    try {
        const userId = req.user.id;
        const recipeId = parseInt(req.params.id, 10);
        
        await recipesService.unlikeRecipe(userId, recipeId);
        res.status(200).json({ message: 'Recipe unliked' });
    } catch (err) {
        console.error('Unlike Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const recipeId = parseInt(req.params.id, 10);
        const { content } = req.body;

        const comment = await recipesService.addComment(userId, recipeId, content);
        res.status(201).json({ message: 'Comment added', comment });
    } catch (err) {
        if (err.message.includes('must be between')) {
            return res.status(400).json({ message: err.message });
        }
        console.error('Add Comment Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getComments = async (req, res) => {
    try {
        const recipeId = parseInt(req.params.id, 10);
        // Pagination query params with defaults
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;

        const result = await recipesService.getComments(recipeId, page, limit);
        res.status(200).json(result);
    } catch (err) {
        console.error('Get Comments Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const userId = req.user.id;
        // JWT auth middleware sets req.user.role
        const isAdmin = req.user.role === 'admin'; 
        
        const recipeId = parseInt(req.params.id, 10);
        const commentId = parseInt(req.params.commentId, 10);

        await recipesService.deleteComment(userId, recipeId, commentId, isAdmin);
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        if (err.message.includes('unauthorized')) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }
        console.error('Delete Comment Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};