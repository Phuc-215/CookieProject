const service = require('../services/ingredients.service');

exports.getList = async (req, res) => {
  try {
    // Gọi service để lấy dữ liệu
    const data = await service.getIngredients();
    
    res.status(200).json({
      message: 'Ingredients fetched successfully',
      data: data
    });
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ 
      message: 'Error fetching ingredients', 
      error: error.message 
    });
  }
};