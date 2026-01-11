var express = require('express');
var router = express.Router();
const { requireAuth, requireVerifiedEmail, maybeAuth } = require('../middlewares/auth.middleware');
const { ensureOwner } = require('../middlewares/owner.middleware');
const { getPublicProfile, updateProfile, uploadAvatar, getUserRecipes, followUser, unfollowUser, deleteAccount, getFollowers, getFollowings } = require('../controllers/user.controller');
const { upload } = require('../middlewares/upload.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { updateProfileSchema } = require('../validations/user.validation');

// Public profile (sensitive fields hidden)
router.get('/:id', getPublicProfile);

// Update profile (self only) - requires verified email
router.put('/:id', requireAuth, requireVerifiedEmail, ensureOwner('id'), validate(updateProfileSchema), updateProfile);

// Upload avatar (multipart/form-data: field name 'avatar') - requires verified email
router.post('/:id/avatar', requireAuth, requireVerifiedEmail, ensureOwner('id'), upload.single('avatar'), uploadAvatar);

// Get user's recipe list sorted by date (owner sees all statuses, others see published)
router.get('/:id/recipes', maybeAuth, getUserRecipes);

// Get followers list
router.get('/:id/followers', getFollowers);

// Get followings list
router.get('/:id/followings', getFollowings);

// Check follow status
router.get('/:id/follow-status', requireAuth, require('../controllers/user.controller').getFollowStatus);

// Follow user (authenticated user follows :id) - requires verified email
router.post('/:id/follow', requireAuth, requireVerifiedEmail, followUser);

// Unfollow user - requires verified email
router.delete('/:id/follow', requireAuth, requireVerifiedEmail, unfollowUser);

// Delete account (self only) - requires verified email
router.delete('/:id', requireAuth, requireVerifiedEmail, ensureOwner('id'), async (req, res) => {  return deleteAccount(req, res);
});

module.exports = router;