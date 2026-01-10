var express = require('express');
var router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const { ensureOwner } = require('../middlewares/owner.middleware');
const { getPublicProfile, updateProfile, uploadAvatar, getUserRecipes } = require('../controllers/user.controller');
const { upload } = require('../middlewares/upload.middleware');

// Public profile (sensitive fields hidden)
router.get('/:id', getPublicProfile);

// Update profile (self only)
router.put('/:id', requireAuth, ensureOwner('id'), updateProfile);

// Upload avatar (multipart/form-data: field name 'avatar')
router.post('/:id/avatar', requireAuth, ensureOwner('id'), upload.single('avatar'), uploadAvatar);

// Get user's recipe list sorted by date
router.get('/:id/recipes', getUserRecipes);

// Delete account (self only)
router.delete('/:id', requireAuth, ensureOwner('id'), async (req, res) => {
  const { deleteAccount } = require('../controllers/user.controller');
  return deleteAccount(req, res);
});

module.exports = router;
