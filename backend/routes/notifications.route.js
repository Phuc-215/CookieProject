const express = require('express');
const router = express.Router();
const controller = require('../controllers/notifications.controller');
// Middleware to ensure user is logged in

// Get Notifications 
router.get('/', controller.getNotifications);

// Mark All Notifications as Read
router.put('/read-all', controller.markAllAsRead);

// Mark Single Notification as Read
router.put('/:id', controller.markAsRead);

module.exports = router;