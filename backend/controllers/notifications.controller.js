const notificationsService = require('../services/notifications.service');

exports.getNotifications = async (req, res) => {
    try {
        const userId = parseInt(req.query.userId, 10);
        console.log('User ID from auth middleware:', userId);
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const type = req.query.type || null; // Optional: ?type=like
        const unreadOnly = req.query.unreadOnly === 'true'; // Optional: ?unreadOnly=true
        console.log('Fetching notifications for user:', userId, 'Page:', page, 'Limit:', limit, 'Type:', type, 'Unread only:', unreadOnly);
        const result = await notificationsService.getNotifications(userId, page, limit, type, unreadOnly);
        console.log('Notifications fetched:', result.notifications);
        res.status(200).json({
            message: 'Notifications fetched',
            notifications: result.notifications,
            meta: {
                totalPages: result.totalPages,
                totalUnreadPages: result.totalUnreadPages,
                page,
                limit,
                totalCount: result.totalCount,
                totalUnread: result.unreadCount
            }
        });
    } catch (err) {
        console.error('Get Notifications Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const notificationId = parseInt(req.params.id, 10);
        const userId = parseInt(req.query.userId, 10);
        if (!userId || Number.isNaN(userId)) {
            return res.status(400).json({ message: 'Missing or invalid userId' });
        }
        console.log('Marking notification as read:', notificationId, 'for user:', userId);
        await notificationsService.markAsRead(userId, notificationId);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (err) {
        console.error('Mark As Read Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = parseInt(req.query.userId, 10);
        if (!userId || Number.isNaN(userId)) {
            return res.status(400).json({ message: 'Missing or invalid userId' });
        }
        console.log('Marking all notifications as read for user:', userId);
        const result = await notificationsService.markAllAsRead(userId);
        res.status(200).json({ message: 'All notifications marked as read', updated: result.updated });
    } catch (err) {
        console.error('Mark All As Read Error:', err);
        res.status(500).json({ message: 'Server error', error: err?.message });
    }
};