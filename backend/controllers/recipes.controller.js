const service = require('../services/recipes.service');

exports.create = async (req, res) => {
    try {
        const result = await service.create(req.body);

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