const searchService = require('../services/search.service');

exports.search = async (req, res) => {
  try {
    const userId = req.userId; 

    const {
        title = '',
        // Expecting arrays of IDs (integers) - [1, 4, 12]
        included_ingredients = [], 
        excluded_ingredients = []
    } = req.body;

    const result = await searchService.search({
        title, 
        ingredientIds_included: included_ingredients, 
        ingredientIds_excluded: excluded_ingredients,
        userId 
    });

    res.status(200).json({
      message: 'Query success',
      results: result.length,
      data: result,
    });

  } catch (err) {
    console.error('Search Controller Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSuggestions = async (req, res) => {
    try {
        const { q = '' } = req.query;
        const suggestions = await searchService.getSuggestions(q);
        res.status(200).json({
            message: 'Suggestions fetched',
            data: suggestions
        });
    } catch (err) {
        console.error('Get Suggestions Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const history = await searchService.getHistory(userId);
        res.status(200).json({
            message: 'Search history fetched',
            data: history
        });
    } catch (err) {
        console.error('Get History Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.clearHistory = async (req, res) => {
    try {
        const userId = req.userId;
        await searchService.clearHistory(userId);
        res.status(200).json({
            message: 'Search history cleared'
        });
    } catch (err) {
        console.error('Clear History Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};