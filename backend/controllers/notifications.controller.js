const notificationsService = require('../services/notifications.service');

exports.getNotifications = async (req, res) => {
    try {
        const userId = 8;
        // Parse Query Params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const type = req.query.type || null; // Optional: ?type=like
        console.log('Fetching notifications for user:', userId, 'Page:', page, 'Limit:', limit, 'Type:', type);
        const result = await notificationsService.getNotifications(userId, page, limit, type);
        console.log('Notifications fetched:', result.notifications);
        res.status(200).json({
            message: 'Notifications fetched',
            data: result.notifications,
            meta: {
                unread_count: result.unreadCount,
                page,
                limit
            }
        });
    } catch (err) {
        console.error('Get Notifications Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        console.log(req.params);
        const userId = 8;
        console.log('User ID from auth middleware:', userId);
        const notificationId = parseInt(req.params.id, 10);
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
        const userId = req.user.id;
        await notificationsService.markAllAsRead(userId);
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Mark All As Read Error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};