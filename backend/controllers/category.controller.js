const service = require('../services/category.service');

exports.getList = async (req, res) => {
  try {    
    const categories = await service.getAll();
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};