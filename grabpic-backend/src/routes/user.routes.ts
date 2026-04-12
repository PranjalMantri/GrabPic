import { Router } from 'express';
import { registerFace } from '../controller/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/register-face', authMiddleware, upload.single('image'), registerFace);

export default router;
