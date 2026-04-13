import { Schema, model, Document, Types } from 'mongoose';

export interface IMedia extends Document {
  url: string;
  publicId: string;
  type: 'image' | 'video';
  size: number; // size in bytes
  uploadedBy: Types.ObjectId;
  eventId: Types.ObjectId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  detections?: any[];
  createdAt: Date;
}

const MediaSchema: Schema = new Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  jobId: { type: String },
  detections: { type: Array, default: [] }
}, { timestamps: true });

export const Media = model<IMedia>('Media', MediaSchema);
