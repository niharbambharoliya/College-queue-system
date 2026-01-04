import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

export const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    let query = { userId: req.user._id };
    if (unreadOnly === 'true') query.isRead = false;

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

    const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    res.json({
        success: true, total, unreadCount, page: parseInt(page),
        pages: Math.ceil(total / limit),
        notifications: notifications.map(n => ({
            id: n._id, type: n.notificationType, title: n.title, message: n.message,
            isRead: n.isRead, relatedBookingId: n.relatedBookingId, sentAt: n.sentAt
        }))
    });
});

export const markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.notificationId, userId: req.user._id },
        { isRead: true }, { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Marked as read' });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All marked as read' });
});

export const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndDelete({ _id: req.params.notificationId, userId: req.user._id });
    if (!notification) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
});

export default { getNotifications, markAsRead, markAllAsRead, deleteNotification };
