const service = require('../services/recipe.service');
const { uploadToSupabase } = require('../utils/upload');

exports.createRecipe = async (req, res) => {
    try {
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

        const result = await service.create({
            ...others,
            ingredients,
            steps,
            thumbnailUrl,
            userId: parseInt(req.body.userId)
        });

        res.status(201).json({
            message: 'Create recipe success',
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

exports.uploadStepImg = async (req, res) => {

}