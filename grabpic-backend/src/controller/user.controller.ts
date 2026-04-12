import { Response } from 'express';
import axios from 'axios';
import FormData from 'form-data';
import { User } from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { uploadToCloudinary } from '../utils/cloudinary';

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
