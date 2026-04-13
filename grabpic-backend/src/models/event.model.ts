import { Schema, model, Document, Types } from 'mongoose';

interface IEvent extends Document {
  name: string;
  description?: string;
  date?: Date;
  owner: Types.ObjectId;
  coverImage: string; 
  media: Types.ObjectId[]; 
  participants: Types.ObjectId[];   
}

const EventSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverImage: { type: String, required: true },
  media: [{ type: Schema.Types.ObjectId, ref: 'Media' }],
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Ensure owner is also a participant
EventSchema.pre('save', async function() {
  const event = this as any;
  if (event.owner && !event.participants.some((p: any) => p.toString() === event.owner.toString())) {
    event.participants.push(event.owner);
  }
});

export const Event = model<IEvent>('Event', EventSchema);
