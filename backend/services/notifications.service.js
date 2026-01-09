const { pool } = require('../db');

/**
 * GET Notifications with Pagination and Data Enrichment
 */
exports.getNotifications = async (userId, page = 1, limit = 20, type = null) => {
    const offset = (page - 1) * limit;
    const values = [userId, limit, offset];
    
    let query = `
        SELECT 
            n.id, 
            n.type, 
            n.is_read, 
            n.created_at,
            n.payload,
            -- Actor details (who triggered it)
            u.id as actor_id,
            u.username as actor_name,
            u.avatar_url as actor_avatar,
            -- Recipe details (context)
            r.id as recipe_id,
            r.slug as recipe_slug,
            r.title as recipe_title,
            r.thumbnail_url as recipe_thumbnail
        FROM notifications n
        LEFT JOIN users u ON n.actor_id = u.id
        LEFT JOIN recipes r ON n.recipe_id = r.id
        WHERE n.user_id = $1
    `;

    // Optional: Filter by specific type if requested
    if (type) {
        values.push(type);
        query += ` AND n.type = $4`;
    }

    query += ` ORDER BY n.created_at DESC LIMIT $2 OFFSET $3`;

    const result = await pool.query(query, values);
    
    // Count total unread for UI badges
    const unreadCountRes = await pool.query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false', 
        [userId]
    );

    return {
        notifications: result.rows,
        unreadCount: parseInt(unreadCountRes.rows[0].count, 10),
        page,
        limit
    };
};

/**
 * Mark specific notification as read
 */
exports.markAsRead = async (userId, notificationId) => {
    await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = $1 AND user_id = $2`,
        [notificationId, userId]
    );
};

/**
 * Mark ALL as read
 */
exports.markAllAsRead = async (userId) => {
    await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1`,
        [userId]
    );
};

// ==========================================
// INTERNAL TRIGGERS (Call these from other Services)
// ==========================================

/**
 * Trigger: When User A follows User B
 */
exports.triggerFollowNotification = async (actorId, targetUserId) => {
    if (parseInt(actorId) === parseInt(targetUserId)) return; // Don't notify self

    await pool.query(
        `INSERT INTO notifications (user_id, actor_id, type)
         VALUES ($1, $2, 'follow')`,
        [targetUserId, actorId]
    );
};

/**
 * Trigger: When User A likes Recipe X
 */
exports.triggerLikeNotification = async (actorId, recipeId) => {
    // Get recipe owner
    const recipeRes = await pool.query('SELECT user_id FROM recipes WHERE id = $1', [recipeId]);
    if (recipeRes.rows.length === 0) return;
    
    const ownerId = recipeRes.rows[0].user_id;
    if (parseInt(actorId) === parseInt(ownerId)) return; // Don't notify self

    await pool.query(
        `INSERT INTO notifications (user_id, actor_id, recipe_id, type)
         VALUES ($1, $2, $3, 'like')
         ON CONFLICT DO NOTHING`, // Prevent spamming notifications for toggle likes
        [ownerId, actorId, recipeId]
    );
};

/**
 * Trigger: When User A comments on Recipe X
 */
exports.triggerCommentNotification = async (actorId, recipeId, commentContent) => {
    // Get recipe owner
    const recipeRes = await pool.query('SELECT user_id FROM recipes WHERE id = $1', [recipeId]);
    if (recipeRes.rows.length === 0) return;

    const ownerId = recipeRes.rows[0].user_id;
    if (parseInt(actorId) === parseInt(ownerId)) return; 

    // Payload can store a snippet of the comment
    const payload = JSON.stringify({ preview: commentContent.substring(0, 50) });

    await pool.query(
        `INSERT INTO notifications (user_id, actor_id, recipe_id, type, payload)
         VALUES ($1, $2, $3, 'comment', $4)`,
        [ownerId, actorId, recipeId, payload]
    );
};

/**
 * Trigger: When User A publishes a new Recipe (Fan-out to followers)
 */
exports.triggerNewRecipeNotification = async (creatorId, recipeId) => {
    // Efficient SQL: Select all followers and Insert into notifications in one go
    await pool.query(
        `INSERT INTO notifications (user_id, actor_id, recipe_id, type)
         SELECT follower_id, $1, $2, 'new_recipe'
         FROM follows
         WHERE followee_id = $1`,
        [creatorId, recipeId]
    );
};