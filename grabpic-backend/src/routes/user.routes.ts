import { Router } from 'express';
import { getProfile, registerFace, updateProfile } from '../controller/user.controller';
import { getUserGallery } from '../controller/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/profile', authMiddleware, getProfile);
router.patch('/profile', authMiddleware, updateProfile);
router.get('/gallery', authMiddleware, getUserGallery);
router.post('/register-face', authMiddleware, upload.single('image'), registerFace);

export default router;
