import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:notificationId/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.delete('/:notificationId', deleteNotification);

export default router;
