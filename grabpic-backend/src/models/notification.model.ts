import { Schema, model, Document, Types } from 'mongoose';

interface INotification extends Document {
  recipientId: Types.ObjectId;
  type: 'event_created' | 'media_processing_complete';
  relatedEventId: Types.ObjectId;
  relatedMediaIds?: Types.ObjectId[];
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: Date;
  expiresAt?: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['event_created', 'media_processing_complete'], 
    required: true 
  },
  relatedEventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  relatedMediaIds: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // 30 days
}, { timestamps: true });

// TTL index to auto-delete notifications after expiration
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = model<INotification>('Notification', NotificationSchema);
