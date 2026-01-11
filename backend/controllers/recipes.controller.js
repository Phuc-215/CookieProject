const service = require('../services/recipes.service');
const { uploadToSupabase } = require('../utils/storage');

exports.getDetail = async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId ? parseInt(req.query.currentUserId) : null;
    console.log("Current User ID from query params:", req.query.currentUserId);
    const recipe = await service.getById(req.params.id, currentUserId);

    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recipe not found" });
    }

    res.json({ success: true, data: recipe });
  } catch (error) {
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.saveRecipe = async (req, res) => {
    try {
        const recipeId = req.body.recipeId || null;
        const userId = parseInt(req.user.id);

        console.log(recipeId, userId);

        const ingredients = req.body.ingredients ? JSON.parse(req.body.ingredients) : [];

        const steps = req.body.steps ? JSON.parse(req.body.steps) : [];

        const {
            title,
            description,
            difficulty,
            category,
            cookTime,
            servings,
        } = req.body;

        images = req.files || [];

        const thumbnailImg = images.find(f => f.fieldname === 'mainImage');
        let thumbnailUrl = null;

        if (thumbnailImg) {
            thumbnailUrl = await uploadToSupabase(thumbnailImg, 'recipe-image', 'recipes');
        } else if (req.body.thumbnailUrl) {
            thumbnailUrl = req.body.thumbnailUrl;
        }

        for (const step of steps) {
            console.log("Step: ", step);
            step.image_urls = step.image_urls || [];

            const stepFiles = images.filter(f => f.fieldname === `step_${step.stepNumber}`);
            if (stepFiles && stepFiles.length > 0) {
                console.log(stepFiles);
                // Upload all images for this specific step concurrently
                // const uploadPromises = stepFiles.map(file => 
                //     uploadToSupabase(file, 'steps')
                // );
                // const uploadedUrls = await Promise.all(uploadPromises);
                const uploadedUrls = await Promise.all(
                    stepFiles.map(file => uploadToSupabase(file, 'steps'))
                );
                step.image_urls.push(...uploadedUrls);
            }
        }

        const result = await service.saveRecipe({
            recipeId: recipeId ? parseInt(recipeId) : null,
            userId,
            title,
            description,
            difficulty,
            category,
            cookTime: cookTime ? parseInt(cookTime) : null,
            servings: servings ? parseInt(servings) : null,
            thumbnailUrl,
            ingredients,
            steps,
        });

        const statusCode = req.body.id ? 200 : 201;
        res.status(statusCode).json({
            recipe: result
        });

    } catch(error) {

        if (error.code === '23505') {
            return res.status(409).json({ 
                message: "A recipe with this title already exists." 
            });
        }

        if (error.code === '23503') {
            return res.status(409).json({
                message: 'User does not exist.'
            });
        }

        return res.status(500).json({ 
            message: "Database Transaction Failed", error: error.message 
        });
    }
};

exports.deleteRecipe = async (req, res) => {
    try {
        await service.deleteRecipe(parseInt(req.params.id), parseInt(req.user.id));
        res.json({ success: true, message: "Recipe deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

exports.likeRecipe = async (req, res) => {
    try {
        const userId = req.user.id;
        const recipeId = parseInt(req.params.id, 10);
        
        await service.likeRecipe(userId, recipeId);
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
        
        await service.unlikeRecipe(userId, recipeId);
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

        const comment = await service.addComment(userId, recipeId, content);
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

        const result = await service.getComments(recipeId, page, limit);
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

        await service.deleteComment(userId, recipeId, commentId, isAdmin);
        res.status(200).json({ message: 'Comment deleted' });
    } catch (err) {
        if (err.message.includes('unauthorized')) {
            return res.status(403).json({ message: 'Unauthorized to delete this comment' });
        }
        console.error('Delete Comment Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};