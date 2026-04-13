import { Router } from 'express';
import { 
  createEvent, 
  getEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  uploadEventMedia,
  joinEvent,
  handleAICallback
} from '../controller/event.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload';

const router = Router();

// public callback for AI service
router.post('/ai-callback', handleAICallback);

router.use(authMiddleware);

router.post('/', upload.single('coverImage'), createEvent);

router.get('/', getEvents);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

router.post('/:id/join', joinEvent);

router.post('/:id/media', upload.array('media', 25), uploadEventMedia);

export default router;
