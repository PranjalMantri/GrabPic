import { Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { User } from '../models/user.model';
import { Media } from '../models/media.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary } from '../utils/cloudinary';

async function getUploadedStorageBytes(userId: string): Promise<number> {
  const uploads = await Media.find({ uploadedBy: userId }).select('size').lean();

  return uploads.reduce((total, media) => total + (typeof media.size === 'number' ? media.size : 0), 0);
}

export const registerFace = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const aiServiceUrl = process.env.AI_SERVICE_URL + "/register";
    
    // The AI service expects face_id (int) as a Form field and file as a File field
    const formData = new FormData();
    // Convert first 8 characters of ObjectId hex string to a numeric ID for the AI service
    const numericFaceId = parseInt(req.user._id.toString().substring(0, 8), 16);
    
    formData.append('face_id', numericFaceId);
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'face_image.jpg',
      contentType: req.file.mimetype,
    }); 

    let aiResponse;
    try {
      
      aiResponse = await axios.post(aiServiceUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
      });

    } catch (error: any) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'AI service error';
      return res.status(statusCode).json({ message: errorMessage });
    }

    if (aiResponse.status === 200) {
      // Upload the image to cloudinary using the new utility
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        'face_registrations',
        `user_${req.user._id}_face`
      );

      const cloudinaryUrl = uploadResult.secure_url;

      // Update user in database
      await User.findByIdAndUpdate(req.user._id, {
        profilePhoto: cloudinaryUrl,
        faceRegistered: true,
      });

      return res.status(200).json({
        message: 'Face registered successfully',
        imageUrl: cloudinaryUrl,
        aiData: aiResponse.data,
      });
    } else {
      return res.status(aiResponse.status).json({
        message: aiResponse.data?.message || 'AI service failed',
      });
    }
  } catch (error: any) {
    console.error('Register face error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uploadStorageBytes = await getUploadedStorageBytes(req.user._id.toString());

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        profilePhoto: user.profilePhoto || null,
        face_registered: user.faceRegistered,
        face_id: user.faceId,
        uploadStorageBytes,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, bio } = req.body;

    const updates: Record<string, string> = {};

    if (typeof name === 'string') {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({ message: 'Name cannot be empty' });
      }
      updates.name = trimmedName;
    }

    if (typeof email === 'string') {
      const trimmedEmail = email.trim().toLowerCase();
      if (!trimmedEmail) {
        return res.status(400).json({ message: 'Email cannot be empty' });
      }

      const existingUser = await User.findOne({
        email: trimmedEmail,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(409).json({ message: 'Email already in use' });
      }

      updates.email = trimmedEmail;
    }

    if (typeof bio === 'string') {
      updates.bio = bio.trim();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const uploadStorageBytes = await getUploadedStorageBytes(req.user._id.toString());

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        profilePhoto: user.profilePhoto || null,
        face_registered: user.faceRegistered,
        face_id: user.faceId,
        uploadStorageBytes,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};
