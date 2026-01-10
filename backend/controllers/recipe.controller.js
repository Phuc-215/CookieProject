const service = require('../services/recipe.service');
const { uploadToSupabase } = require('../utils/storage');

exports.getDetail = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    
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
        const userId = parseInt(req.params.id);
        if (Number.isNaN(userId)) {
            return res.status(400).json({ message: 'INVALID_USER_ID' });
        }

        if (!req.user || req.user.id !== userId) {
            return res.status(403).json({ message: 'FORBIDDEN' });
        }

        let { ingredients, steps, ...others } = req.body;

        images = req.files || [];

        const thumbnailImg = images.find(f => f.fieldname === 'thumbnail');
        let thumbnailUrl = null;

        if (thumbnailImg) {
            thumbnailUrl = await uploadToSupabase(thumbnailImg, 'recipes');
        } else if (req.body.thumbnailUrl) {
            thumbnailUrl = req.body.thumbnailUrl;
        }

        if (steps && Array.isArray(steps)) {
            for (let i = 0; i < steps.length; i++) {
                if (!steps[i].imageUrls) {
                    steps[i].imageUrls = [];
                }

                const stepFiles = allFiles.filter(f => f.fieldname === `step_${i}_images`);
                if (stepFiles.length > 0) {
                    // Upload all images for this specific step concurrently
                    const uploadPromises = stepFiles.map(file => 
                        uploadToSupabase(file, 'steps')
                    );
                    const uploadedUrls = await Promise.all(uploadPromises);
                    steps[i].imageUrls.push(...uploadedUrls);
                }
            }
        }

        const result = await service.saveRecipe({
            ...others,
            ingredients,
            steps,
            thumbnailUrl,
            userId: parseInt(userId)
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

exports.updateRecipe = async (req, res) => {
    try {

        const result = await service.saveRecipe({
            recipeId: req.params.id,
            userId: req.user.id,
            ...req.body,
        });

        res.status(200).json({
            success: true,
            message: "Recipe updated successfully",
        });

    } catch (error) {
        // Handle Zod Validation Errors
        if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, errors: error.errors });
        }
        
        // Handle "Recipe not found" or "Unauthorized" from Service
        if (error.message.includes("Unauthorized") || error.message.includes("permission")) {
        return res.status(403).json({ success: false, message: error.message });
        }

        console.error("Update Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

exports.deleteRecipe = async (req, res) => {
    try {
        await service.deleteRecipe(parseInt(req.params.id), parseInt(req.user.id));
        res.json({ success: true, message: "Recipe deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}