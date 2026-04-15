import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  deleteNotification
} from '../controller/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All notification routes are protected
router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.patch('/:id/read', authMiddleware, markAsRead);
router.delete('/:id', authMiddleware, deleteNotification);

export default router;
