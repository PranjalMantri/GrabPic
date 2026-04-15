import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';
import { Types } from 'mongoose';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { limit = 20, skip = 0, isRead } = req.query;

    const query: any = { recipientId: userId };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string) || 20)
      .skip(parseInt(skip as string) || 0);

    const total = await Notification.countDocuments(query);

    res.status(200).json({ 
      notifications, 
      total,
      limit: parseInt(limit as string) || 20,
      skip: parseInt(skip as string) || 0
    });
  } catch (error) {
    console.error('[GetNotifications] Error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const unreadCount = await Notification.countDocuments({ 
      recipientId: userId, 
      isRead: false 
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('[GetUnreadCount] Error:', error);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('[MarkAsRead] Error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('[DeleteNotification] Error:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
};

// Internal helper function to create notifications (not exposed as route)
export const createNotification = async (
  recipientId: Types.ObjectId,
  type: 'event_created' | 'media_processing_complete',
  eventId: Types.ObjectId,
  mediaIds?: Types.ObjectId[],
  title?: string,
  message?: string
): Promise<void> => {
  try {
    const notification = new Notification({
      recipientId,
      type,
      relatedEventId: eventId,
      relatedMediaIds: mediaIds || [],
      title: title || getDefaultTitle(type),
      message: message || getDefaultMessage(type, mediaIds?.length || 0)
    });

    await notification.save();
    console.log(`[CreateNotification] Notification created for user ${recipientId}: ${type}`);
  } catch (error) {
    console.error('[CreateNotification] Error:', error);
  }
};

// Helper functions for default notification messages
const getDefaultTitle = (type: string): string => {
  switch (type) {
    case 'event_created':
      return 'New Event Created';
    case 'media_processing_complete':
      return 'Photos Ready';
    default:
      return 'New Notification';
  }
};

const getDefaultMessage = (type: string, mediaCount: number = 0): string => {
  switch (type) {
    case 'event_created':
      return 'Your event has been created successfully';
    case 'media_processing_complete':
      return `Your ${mediaCount} photo(s) have been processed and are ready to view`;
    default:
      return 'You have a new notification';
  }
};
