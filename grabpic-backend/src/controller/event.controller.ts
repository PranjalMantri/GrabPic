import { Request, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth.middleware';
import { Event } from '../models/event.model';
import { Media } from '../models/media.model';
import { uploadToCloudinary } from '../utils/cloudinary';
import { randomUUID } from 'crypto';

export const createEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const owner = req.user._id;

    if (!req.file) {
      return res.status(400).json({ message: 'Cover image is required' });
    }

    const publicId = `grabpic/events/covers/${randomUUID()}`;
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'event_covers', publicId);

    const event = await Event.create({
      name,
      description,
      owner,
      coverImage: uploadResult.secure_url,
      participants: [owner]
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({ message: 'Failed to create event' });
  }
};

export const getEvents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    // Show events where the user is a participant
    const events = await Event.find({ participants: userId }).sort({ createdAt: -1 });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id)
      .populate('owner', 'name email profilePhoto')
      .populate('media');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the user is a participant
    const isParticipant = event.participants.some(p => p.toString() === req.user._id.toString());
    
    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied: You are not a participant of this event' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event' });
  }
};

export const joinEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Add user to participants if not already added
    if (!event.participants.some(p => p.toString() === userId.toString())) {
      event.participants.push(userId);
      await event.save();
    }

    res.status(200).json({ message: 'Joined event successfully', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, date } = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { name, description, date },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found or you are not the owner' });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!event) {
      return res.status(404).json({ message: 'Event not found or you are not the owner' });
    }

    await Media.deleteMany({ eventId: id });

    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
};

export const uploadEventMedia = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const event = await Event.findOne({ _id: id, owner: req.user._id });

    if (!event) {
      console.warn(`[UploadEventMedia] Event ${id} not found or unauthorized access by user ${req.user._id}`);
      return res.status(404).json({ message: 'Event not found or you are not the owner' });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      console.warn(`[UploadEventMedia] No files provided in the request for event ${id}`);
      return res.status(400).json({ message: 'No media files uploaded' });
    }

    const files = req.files as Express.Multer.File[];
    const mediaDocs = [];

    const aiServiceUrl = process.env.AI_SERVICE_URL!;
    const appUrl = process.env.APP_URL!;
    const callbackUrl = `${appUrl}/api/events/ai-callback`;

    // Process files one by one to avoid overwhelming AI service and ensure job IDs are captured
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      const publicId = `grabpic/events/${id}/${randomUUID()}`;
      
      const uploadResult = await uploadToCloudinary(file.buffer, 'events', publicId);

      const mediaType = file.mimetype.startsWith('video') ? 'video' : 'image';
      
      const media = await Media.create({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: mediaType,
        size: file.size,
        uploadedBy: req.user._id,
        eventId: event._id,
        status: 'pending'
      });

      // Call AI Service
      try {
        const endpoint = mediaType === 'image' ? '/index-event-photo' : '/index-event-video';
        
        const payload = mediaType === 'image' ? {
          event_id: id,
          image_url: media.url,
          callback_url: callbackUrl
        } : {
          event_id: id,
          video_url: media.url,
          callback_url: callbackUrl
        };

        const response = await axios.post(`${aiServiceUrl}${endpoint}`, payload);
        
        media.jobId = response.data.job_id;
        media.status = 'processing';
        await media.save();
      } catch (error) {
        console.error(`[UploadEventMedia] [${i + 1}/${files.length}] AI Service Error for media ${media._id}:`, error);
        media.status = 'failed';
        await media.save();
      }

      mediaDocs.push(media);
    }

    // Add media IDs to event
    event.media.push(...mediaDocs.map(m => m._id as any));
    await event.save();

    res.status(200).json({ 
      message: 'Media uploaded and queued for processing', 
      media: mediaDocs 
    });
  } catch (error) {
    console.error('[UploadEventMedia] Critical Upload Error:', error);
    res.status(500).json({ message: 'Failed to upload media' });
  }
};

export const handleAICallback = async (req: Request, res: Response) => {
  try {
    const { job_id, status, detections, error } = req.body;
    
    if (error) {
      console.error(`[AICallback] Job ${job_id} reported error:`, error);
    }

    const media = await Media.findOne({ jobId: job_id });
    if (!media) {
      console.warn(`[AICallback] Media record search failed: No media found for job ID ${job_id}`);
      return res.status(404).json({ message: 'Media not found for this job ID' });
    }

    media.status = status === 'completed' ? 'completed' : 'failed';
    
    if (detections) {
      media.detections = detections;
    }
    
    await media.save();

    res.status(200).json({ message: 'Callback processed successfully' });
  } catch (error) {
    console.error('[AICallback] Critical Callback Processing Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
