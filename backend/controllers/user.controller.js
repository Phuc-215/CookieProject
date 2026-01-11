const { pool } = require('../config/db');
const path = require('path');
const { supabase } = require('../config/supabase');
const notificationService = require('../services/notifications.service');

exports.getPublicProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    const result = await pool.query(
      `SELECT id, username, email, is_verified, avatar_url, bio, followers_count, following_count, recipes_count
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'USER_NOT_FOUND' });
    }

    const user = result.rows[0];
    return res.json({
      id: user.id,
      username: user.username,
      email: user.email || '',
      is_verified: user.is_verified,
      avatar_url: user.avatar_url || null,
      bio: user.bio || '',
      followers_count: user.followers_count || 0,
      following_count: user.following_count || 0,
      recipes_count: user.recipes_count || 0,
    });
  } catch (err) {
    console.error('getPublicProfile error:', err);
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    console.log('[updateProfile] userId from path:', userId, 'req.user.id:', req.user?.id);

    if (!req.user || req.user.id !== userId) {
      console.error('[updateProfile] FORBIDDEN: user id mismatch', { reqUserId: req.user?.id, pathId: userId });
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    const value = req.body;
    const updates = [];
    const params = [];
    let idx = 1;

    if (value.username) {
      const username = value.username.trim();
      const usernameCheck = await pool.query(
        `SELECT id FROM users WHERE username = $1 AND id <> $2`,
        [username, userId]
      );

      if (usernameCheck.rowCount > 0) {
        return res.status(400).json({ message: 'USERNAME_EXISTS' });
      }

      updates.push(`username = $${idx++}`);
      params.push(username);
    }

    if (value.email) {
      const email = value.email.trim().toLowerCase();
      const emailCheck = await pool.query(
        `SELECT id FROM users WHERE email = $1 AND id <> $2`,
        [email, userId]
      );

      if (emailCheck.rowCount > 0) {
        return res.status(400).json({ message: 'EMAIL_EXISTS' });
      }

      updates.push(`email = $${idx++}`);
      params.push(email);
    }

    if (value.avatar_url !== undefined) {
      updates.push(`avatar_url = $${idx++}`);
      params.push(value.avatar_url || null);
    }

    if (value.bio !== undefined) {
      updates.push(`bio = $${idx++}`);
      params.push(value.bio === null ? '' : value.bio.trim());
    }

    if (updates.length === 0) {
      // No fields to update - return current user data
      const result = await pool.query(
        `SELECT id, username, email, is_verified, avatar_url, bio FROM users WHERE id = $1`,
        [userId]
      );
      return res.json({ user: result.rows[0] });
    }

    params.push(userId);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, username, email, is_verified, avatar_url, bio`,
      params
    );

    return res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'NO_FILE_UPLOADED' });
    }

    const bucket = process.env.SUPABASE_AVATARS_BUCKET || 'avatars';
    const mime = req.file.mimetype;
    const orig = req.file.originalname || '';
    const ext = (path.extname(orig) || '').toLowerCase().replace('.', '') || 'png';
    const objectPath = `${userId}/${Date.now()}.${ext}`;

    const { error: upErr } = await supabase
      .storage
      .from(bucket)
      .upload(objectPath, req.file.buffer, { contentType: mime, upsert: true, cacheControl: '3600' });

    if (upErr) {
      console.error('Supabase upload error:', upErr);
      return res.status(500).json({ message: 'SUPABASE_UPLOAD_FAILED' });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    const publicUrl = data.publicUrl;

    await pool.query(
      `UPDATE users SET avatar_url = $1 WHERE id = $2`,
      [publicUrl, userId]
    );

    return res.json({ avatarUrl: publicUrl });
  } catch (err) {
    const msg = err?.message === 'INVALID_IMAGE_TYPE' ? 'INVALID_IMAGE_TYPE' : 'INTERNAL_SERVER_ERROR';
    console.error('uploadAvatar error:', err);
    return res.status(500).json({ message: msg });
  }
};

exports.getUserRecipes = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    // Show all statuses for now to ensure recipes appear on profile
    const statusFilter = '';

    try {
      const result = await pool.query(
        `SELECT id, title, thumbnail_url AS image, created_at, difficulty, cook_time_min, status, likes_count
         FROM recipes
         WHERE user_id = $1 ${statusFilter}
         ORDER BY created_at DESC`,
        [userId]
      );

      return res.json({ recipes: result.rows });
    } catch (dbErr) {
      console.warn('Recipes table not available or query failed:', dbErr.message);
      return res.json({ recipes: [] });
    }
  } catch (err) {
    console.error('getUserRecipes error:', err);
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    if (!req.user || req.user.id !== userId) {
      return res.status(403).json({ message: 'FORBIDDEN' });
    }

    // Get list of users who follow this user & users this user follows (for count update)
    const followersResult = await pool.query(
      `SELECT follower_id FROM follows WHERE followee_id = $1`,
      [userId]
    );
    const followingResult = await pool.query(
      `SELECT followee_id FROM follows WHERE follower_id = $1`,
      [userId]
    );

    // Hybrid delete: keep recipes & comments, but anonymize user data
    // Step 1: Set recipes.user_id to NULL (keep recipe history)
    await pool.query(
      `UPDATE recipes SET user_id = NULL WHERE user_id = $1`,
      [userId]
    );

    // Step 2: Set comments.user_id to NULL (keep comment history)
    await pool.query(
      `UPDATE comments SET user_id = NULL WHERE user_id = $1`,
      [userId]
    );

    // Step 3: Delete follower/followee relationships
    await pool.query(
      `DELETE FROM follows WHERE follower_id = $1 OR followee_id = $1`,
      [userId]
    );

    // Step 3b: Decrease following_count for users who were following this user
    if (followersResult.rowCount > 0) {
      const followerIds = followersResult.rows.map(r => r.follower_id);
      await pool.query(
        `UPDATE users SET following_count = GREATEST(0, following_count - 1) 
         WHERE id = ANY($1)`,
        [followerIds]
      );
    }

    // Step 3c: Decrease followers_count for users this user was following
    if (followingResult.rowCount > 0) {
      const followingIds = followingResult.rows.map(r => r.followee_id);
      await pool.query(
        `UPDATE users SET followers_count = GREATEST(0, followers_count - 1) 
         WHERE id = ANY($1)`,
        [followingIds]
      );
    }

    // Step 4: Delete all notifications for/from this user
    await pool.query(
      `DELETE FROM notifications WHERE user_id = $1 OR actor_id = $1`,
      [userId]
    );

    // Step 5: Delete likes
    await pool.query(
      `DELETE FROM likes WHERE user_id = $1`,
      [userId]
    );

    // Step 6: Delete collections (cascade will delete collection_recipes)
    await pool.query(
      `DELETE FROM collections WHERE user_id = $1`,
      [userId]
    );

    // Step 7: Delete refresh tokens
    await pool.query(
      `DELETE FROM refresh_tokens WHERE user_id = $1`,
      [userId]
    );

    // Step 8: Delete user account
    const result = await pool.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, username, email`,
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'USER_NOT_FOUND' });
    }

    console.log('[deleteAccount] Account deleted (hybrid):', result.rows[0]);
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('deleteAccount error:', err);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};
exports.followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followeeId = parseInt(req.params.id, 10);

    if (Number.isNaN(followeeId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    // Check: cannot follow self
    if (followerId === followeeId) {
      return res.status(400).json({ message: 'CANNOT_FOLLOW_SELF' });
    }

    // Check: followee exists
    const followeeCheck = await pool.query(
      `SELECT id FROM users WHERE id = $1`,
      [followeeId]
    );
    if (followeeCheck.rowCount === 0) {
      return res.status(404).json({ message: 'USER_NOT_FOUND' });
    }

    // Check: not already following (prevent duplicate)
    const existingFollow = await pool.query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2`,
      [followerId, followeeId]
    );
    if (existingFollow.rowCount > 0) {
      return res.status(400).json({ message: 'ALREADY_FOLLOWING' });
    }

    // Insert follow relationship
    await pool.query(
      `INSERT INTO follows (follower_id, followee_id, created_at)
       VALUES ($1, $2, now())`,
      [followerId, followeeId]
    );

    // Increment counters
    await pool.query(
      `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
      [followerId]
    );
    await pool.query(
      `UPDATE users SET followers_count = followers_count + 1 WHERE id = $1`,
      [followeeId]
    );

    // Trigger notification
    await notificationService.triggerFollowNotification(followerId, followeeId);

    // OLD: await pool.query(
    //   `INSERT INTO notifications (user_id, actor_id, type)
    //    VALUES ($1, $2, 'follow')`,

    res.json({ message: 'User followed successfully' });
  } catch (err) {
    console.error('followUser error:', err);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followeeId = parseInt(req.params.id, 10);

    if (Number.isNaN(followeeId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    if (followerId === followeeId) {
      return res.status(400).json({ message: 'CANNOT_UNFOLLOW_SELF' });
    }

    // Ensure relationship exists
    const del = await pool.query(
      `DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2`,
      [followerId, followeeId]
    );

    if (del.rowCount === 0) {
      return res.status(400).json({ message: 'NOT_FOLLOWING' });
    }

    // Decrement counters safely
    await pool.query(
      `UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1`,
      [followerId]
    );
    await pool.query(
      `UPDATE users SET followers_count = GREATEST(followers_count - 1, 0) WHERE id = $1`,
      [followeeId]
    );

    res.json({ message: 'User unfollowed successfully' });
  } catch (err) {
    console.error('unfollowUser error:', err);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

exports.getFollowStatus = async (req, res) => {
  try {
    const followerId = req.user.id;
    const followeeId = parseInt(req.params.id, 10);

    if (Number.isNaN(followeeId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    const result = await pool.query(
      `SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2`,
      [followerId, followeeId]
    );

    res.json({ isFollowing: result.rowCount > 0 });
  } catch (err) {
    console.error('getFollowStatus error:', err);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM follows f
       JOIN users u ON f.follower_id = u.id
       WHERE f.followee_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error('getFollowers error:', err);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};

exports.getFollowings = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    const result = await pool.query(
      `SELECT u.id, u.username, u.avatar_url
       FROM follows f
       JOIN users u ON f.followee_id = u.id
       WHERE f.follower_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );

    res.json({ users: result.rows });
  } catch (err) {
    console.error('getFollowings error:', err);
    res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
  }
};