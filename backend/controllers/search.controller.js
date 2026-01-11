const searchService = require('../services/search.service');




exports.search = async (req, res) => {
  try {
    const {
        title = '',
        // Expecting arrays of strings (ingredient names) - ['flour', 'sugar']
        ingredients_included = [], 
        ingredients_excluded = [],
        difficulty = '',
        category = '',
        sort = '',
        page = 1,
        limit = 10,
        type = 'recipes',
        userId = ''
    } = req.body;
    const result = await searchService.search({
        title, 
        ingredientIds_included: ingredients_included, 
        ingredientIds_excluded: ingredients_excluded,
        difficulty,
        category,
        sort,
        page,
        limit,
        userId: Number(userId),
    });

    res.status(200).json({
      message: 'Query success',
      results: result.results,
      meta: {
        totalRecipes: result.total,
        totalPages: Math.ceil(result.total / limit),
        page: result.page,
        limit: result.limit
      }
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
        const userId = parseInt(req.user?.id, 10); 
        console.log('Get History for user:', userId);

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
        const userId = parseInt(req.user?.id, 10); 
        console.log('Clear History for user:', userId);

        await searchService.clearHistory(userId);
        res.status(200).json({
            message: 'Search history cleared'
        });
    } catch (err) {
        console.error('Clear History Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteHistoryItem = async (req, res) => {
    try {
        const userId = parseInt(req.user?.id, 10); 
        const historyId = parseInt(req.params.id, 10);
        console.log('Delete History Item for user:', userId);
        console.log('History ID to delete:', historyId);
        
        await searchService.deleteHistoryItem(userId, historyId);
        res.status(200).json({
            message: 'Search history item deleted'
        });
    } catch (err) {
        console.error('Delete History Item Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};