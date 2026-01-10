const { pool } = require('../config/db');
const { updateProfileSchema } = require('../validations/user.validation');
const path = require('path');
const { supabase } = require('../config/supabaseClient');

exports.getPublicProfile = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'INVALID_USER_ID' });
    }

    const result = await pool.query(
      `SELECT id, username, is_verified, avatar_url, bio
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
      is_verified: user.is_verified,
      avatar_url: user.avatar_url || null,
      bio: user.bio || '',
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

    const { error, value } = updateProfileSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: 'VALIDATION_ERROR',
        details: error.details.map((d) => d.message),
      });
    }

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
      return res.status(400).json({ message: 'NO_FIELDS_TO_UPDATE' });
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

    // Try querying recipes table; if not exists, return []
    try {
      const result = await pool.query(
        `SELECT id, title, image, created_at
         FROM recipes
         WHERE author_id = $1
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
