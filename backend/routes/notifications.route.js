const express = require('express');
const router = express.Router();
const controller = require('../controllers/notifications.controller');
const { requireAuth, requireVerifiedEmail } = require('../middlewares/auth.middleware');

// All notification routes require verified email
router.use(requireAuth, requireVerifiedEmail);

// Get Notifications 
router.get('/', controller.getNotifications);

// Mark All Notifications as Read
router.put('/read-all', controller.markAllAsRead);

// Mark Single Notification as Read
router.put('/:id', controller.markAsRead);

module.exports = router;