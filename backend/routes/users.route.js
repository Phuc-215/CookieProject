var express = require('express');
var router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const { getPublicProfile, updateProfile, uploadAvatar, getUserRecipes } = require('../controllers/user.controller');
const { upload } = require('../middlewares/upload.middleware');

// Public profile (sensitive fields hidden)
router.get('/:id', getPublicProfile);

// Update profile (self only)
router.put('/:id', requireAuth, updateProfile);

// Upload avatar (multipart/form-data: field name 'avatar')
router.post('/:id/avatar', requireAuth, upload.single('avatar'), uploadAvatar);

// Get user's recipe list sorted by date
router.get('/:id/recipes', getUserRecipes);

module.exports = router;
