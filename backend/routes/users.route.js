var express = require('express');
var router = express.Router();
const { requireAuth } = require('../middlewares/auth.middleware');
const { ensureOwner } = require('../middlewares/owner.middleware');
const { getPublicProfile, updateProfile, uploadAvatar, getUserRecipes, followUser, unfollowUser, deleteAccount, getFollowers, getFollowings } = require('../controllers/user.controller');
const { upload } = require('../middlewares/upload.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../validations/user.validation');

// Public profile (sensitive fields hidden)
router.get('/:id', getPublicProfile);

// Update profile (self only)
router.put('/:id', requireAuth, ensureOwner('id'), validate(updateProfileSchema), updateProfile);

// Upload avatar (multipart/form-data: field name 'avatar')
router.post('/:id/avatar', requireAuth, ensureOwner('id'), upload.single('avatar'), uploadAvatar);

// Get user's recipe list sorted by date
router.get('/:id/recipes', getUserRecipes);

// Get followers list
router.get('/:id/followers', getFollowers);

// Get followings list
router.get('/:id/followings', getFollowings);

// Check follow status
router.get('/:id/follow-status', requireAuth, require('../controllers/user.controller').getFollowStatus);

// Follow user (authenticated user follows :id)
router.post('/:id/follow', requireAuth, followUser);

// Unfollow user
router.delete('/:id/follow', requireAuth, unfollowUser);

// Delete account (self only)
router.delete('/:id', requireAuth, ensureOwner('id'), async (req, res) => {  return deleteAccount(req, res);
});

module.exports = router;