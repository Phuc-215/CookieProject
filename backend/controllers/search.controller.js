const searchService = require('../services/search.service');




exports.search = async (req, res) => {
  try {
    const userId = req.userId; 

    const {
        title = '',
        // Expecting arrays of IDs (integers) - [1, 4, 12]
        included_ingredients = [], 
        excluded_ingredients = [],
        difficulty = '',
        category = '',
        sort = '',
        page = 1,
        limit = 10,
        type = 'recipes'
    } = req.query;
    console.log('Search Params:', {
        title,
        included_ingredients,
        excluded_ingredients,
        difficulty,
        category,
        sort,
        page,
        limit,
        type
    });

    // if (type === 'collections') {
    //     // Handle collection search separately if needed
    // }
    const result = await searchService.search({
        title, 
        ingredientIds_included: included_ingredients, 
        ingredientIds_excluded: excluded_ingredients,
        difficulty,
        category,
        sort,
        page,
        limit,
        userId 
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