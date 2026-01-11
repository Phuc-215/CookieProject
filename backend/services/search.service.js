// services/search.service.js
const { pool } = require('../config/db');

        // title, 
        // ingredientIds_included: included_ingredients, 
        // ingredientIds_excluded: excluded_ingredients,
        // difficulty,
        // category,
        // sort,
        // page,
        // limit,
        // userId 


exports.search = async ({ title, ingredientIds_included, ingredientIds_excluded, difficulty, category, sort, page, limit, userId }) => {
    // 1. Base Query
    let query = `
        SELECT r.id, r.slug, r.title, r.difficulty, r.thumbnail_url, 
               r.cook_time_min, r.likes_count, r.created_at,
               ts_rank(r.search_vector, plainto_tsquery('english', $1)) as rank
        FROM recipes r
        WHERE r.status = 'published'
    `;
    
    const values = [title || '']; 
    let index = 2;

    // 2. Full-Text Search (Using your existing search_vector column)
    if (title) {
        // Your schema has a GIN index on search_vector, this utilizes it:
        query += ` AND r.search_vector @@ plainto_tsquery('english', $1)`;
    }

    // 3. Include Ingredients (Relational "AND" Logic)
    // "Find recipes that contain ALL of these ingredient IDs"
    if (ingredientIds_included && ingredientIds_included.length > 0) {
        query += `
            AND r.id IN (
                SELECT ri.recipe_id
                FROM recipe_ingredients ri
                WHERE ri.ingredient_id = ANY($${index}::bigint[])
                GROUP BY ri.recipe_id
                HAVING COUNT(DISTINCT ri.ingredient_id) = $${index + 1}
            )
        `;
        values.push(ingredientIds_included); // $2
        values.push(ingredientIds_included.length); // $3
        index += 2;
    }

    // 4. Exclude Ingredients (Relational "NOT IN" Logic)
    // "Find recipes that DO NOT contain ANY of these ingredient IDs"
    if (ingredientIds_excluded && ingredientIds_excluded.length > 0) {
        query += `
            AND NOT EXISTS (
                SELECT 1
                FROM recipe_ingredients ri
                WHERE ri.recipe_id = r.id
                AND ri.ingredient_id = ANY($${index}::bigint[])
            )
        `;
        values.push(ingredientIds_excluded); 
        index++;
    }

    // 5. Difficulty Filter
    if (difficulty) {
        query += ` AND r.difficulty = $${index}`;
        values.push(difficulty);
        index++;
    }

    // 6. Category Filter
    if (category) {
        query += `
            AND r.id IN (
                SELECT rc.recipe_id
                FROM recipe_categories rc
                WHERE rc.category = $${index}
            )
        `;
        values.push(category);
        index++;
    }

    // 7. Sorting
    // If searching text, sort by Rank. Otherwise sort by Trending or Newest.
    if (sort == 'popular') {
        query += ` ORDER BY rank DESC, r.likes_count DESC`;
    } else if (sort == 'newest') {
        query += ` ORDER BY r.created_at DESC`;
    }

    // 8. Execute
    const result = await pool.query(query, values);

    // 9. Save History (Async, don't await blocking the response)
    if (userId && title) {
        this.saveHistory(userId, title).catch(err => console.error('History save error', err));
    }

    const offset = (page - 1) * limit;
    query += ` LIMIT $${index} OFFSET $${index + 1}`;
    const paginatedResult = await pool.query(query, [...values, limit, offset]);

    return {
        results: paginatedResult.rows,
        total: result.rowCount,
        page,
        limit
    }
};

exports.getSuggestions = async (partialQuery) => {
    if (!partialQuery) return [];
    
    // Suggest Titles from recipes
    const query = `
        SELECT title 
        FROM recipes 
        WHERE title ILIKE $1 
        ORDER BY likes_count DESC 
        LIMIT 5
    `;
    const result = await pool.query(query, [`%${partialQuery}%`]);
    return result.rows;
};

exports.saveHistory = async (userId, queryText) => {
    // Insert new history
    await pool.query(
        `INSERT INTO search_history (user_id, query_text) VALUES ($1, $2)`, 
        [userId, queryText]
    );

    // Maintenance: Keep only last 10
    await pool.query(`
        DELETE FROM search_history 
        WHERE id NOT IN (
            SELECT id FROM search_history 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        ) AND user_id = $1
    `, [userId]);
};

exports.getHistory = async (userId) => {
    const result = await pool.query(
        `SELECT query_text, created_at FROM search_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [userId]
    );
    return result.rows;
};

exports.clearHistory = async (userId) => {
    await pool.query(`DELETE FROM search_history WHERE user_id = $1`, [userId]);
};