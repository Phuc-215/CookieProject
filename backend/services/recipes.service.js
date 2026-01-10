// services/recipes.service.js
const { pool } = require('../config/db');

exports.likeRecipe = async (userId, recipeId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Insert like record
        const insertLikeText = `
            INSERT INTO recipe_likes (user_id, recipe_id, created_at)
            VALUES ($1, $2, NOW())
            ON CONFLICT DO NOTHING
        `;
        await client.query(insertLikeText, [userId, recipeId]);

        // Update likes count
        const updateLikesCountText = `
            UPDATE recipes
            SET likes_count = likes_count + 1
            WHERE id = $1
        `;
        await client.query(updateLikesCountText, [recipeId]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

exports.unlikeRecipe = async (userId, recipeId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Delete like record
        const deleteLikeText = `
            DELETE FROM recipe_likes
            WHERE user_id = $1 AND recipe_id = $2
        `;
        await client.query(deleteLikeText, [userId, recipeId]);

        // Update likes count
        const updateLikesCountText = `
            UPDATE recipes
            SET likes_count = GREATEST(likes_count - 1, 0)
            WHERE id = $1
        `;
        await client.query(updateLikesCountText, [recipeId]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

exports.addComment = async (userId, recipeId, content) => {
    const insertCommentText = `
        INSERT INTO recipe_comments (user_id, recipe_id, content, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, user_id, recipe_id, content, created_at
    `;
    const result = await pool.query(insertCommentText, [userId, recipeId, content]);
    return result.rows[0];
};

exports.getComments = async (recipeId) => {
    const getCommentsText = `
        SELECT rc.id, rc.user_id, rc.recipe_id, rc.content, rc.created_at, u.username
        FROM recipe_comments rc
        JOIN users u ON rc.user_id = u.id
        WHERE rc.recipe_id = $1
        ORDER BY rc.created_at DESC
    `;
    const result = await pool.query(getCommentsText, [recipeId]);
    return result.rows;
};

exports.deleteComment = async (userId, recipeId, commentId) => {
    const deleteCommentText = `
        DELETE FROM recipe_comments
        WHERE id = $1 AND recipe_id = $2 AND user_id = $3
    `;
    await pool.query(deleteCommentText, [commentId, recipeId, userId]);
};
