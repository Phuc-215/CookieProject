// services/search.service.js
const { pool } = require('../config/db');

exports.search = async ({ title, ingredientIds_included, ingredientIds_excluded, difficulty, category, sort, page, limit, userId }) => {    
    // 1. Build query with conditional parameter handling
    const hasTitle = title && title.trim();
    const values = [];
    let index = 1;

    // Build SELECT clause - only use ts_rank if title exists
    let selectClause = `
        SELECT  r.id, 
                r.slug, 
                r.title, 
                r.difficulty, 
                r.thumbnail_url,       
                r.cook_time_min, 
                r.likes_count, 
                r.created_at`;
    if (userId) {
        selectClause += `,
            EXISTS (
                SELECT 1
                FROM likes l
                WHERE l.recipe_id = r.id AND l.user_id = $${index}
            ) AS user_liked`;
        values.push(userId);
        index++;
        selectClause += `
            , EXISTS (
                SELECT 1
                FROM collection_recipes cr
                JOIN collections c ON cr.collection_id = c.id
                WHERE cr.recipe_id = r.id AND c.user_id = $${index}
            ) AS in_user_collections`;
        values.push(userId);
        index++;
    }
    if (hasTitle) {
        selectClause += `, ts_rank(r.search_vector, to_tsquery('english', $${index})) as rank`;
        // Split title into words and add prefix matching with :* for substring search
        const words = title.trim().split(/\s+/).filter(w => w.length > 0);
        const tsqueryString = words.map(w => `${w.toLowerCase()}:*`).join(' & ');
        values.push(tsqueryString);
        index++;
    } else {
        selectClause += `, 0 as rank`;
    }

    let query = selectClause + `
        FROM recipes r
        WHERE r.status = 'published'
    `;

    // 2. Full-Text Search (Using your existing search_vector column)
    if (hasTitle) {
        // Use prefix matching (:*) to find words starting with the search terms
        // "test" matches "test", "testing", "contest", etc.
        // "test auction" matches documents with words starting with both
        query += ` AND r.search_vector @@ to_tsquery('english', $${index - 1})`;
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

    // 8. Execute first query to get total count
    const result = await pool.query(query, values);
    
    // 9. Save History (Async, don't await blocking the response)
    if (userId && hasTitle) {
        this.saveHistory(userId, title).catch(err => console.error('History save error', err));
    }

    // 10. Add pagination to the query
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
        AND status = 'published' 
        ORDER BY likes_count DESC 
        LIMIT 5
    `;
    const values = [`%${partialQuery}%`];
    const result = await pool.query(query, values);
    return result.rows.map(row => row.title);
};

exports.saveHistory = async (userId, queryText) => {
    // Check if the same query already exists for the user
    const existing = await pool.query(
        `SELECT id FROM search_history WHERE user_id = $1 AND query_text = $2`,
        [userId, queryText]
    );

    if (existing.rowCount > 0) {
        // Update timestamp
        await pool.query(
            `UPDATE search_history SET created_at = NOW() WHERE id = $1`,
            [existing.rows[0].id]
        );
    }
    else {
        // Insert new history record
        await pool.query(
            `INSERT INTO search_history (user_id, query_text, created_at) VALUES ($1, $2, NOW())`,
            [userId, queryText]
        );
    }
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

exports.deleteHistoryItem = async (userId, historyId) => {
    await pool.query(`DELETE FROM search_history WHERE user_id = $1 AND id = $2`, [userId, historyId]);
};