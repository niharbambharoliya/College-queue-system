import express from 'express';
import { getProfile, updateProfile, getChildProfile } from '../controllers/profileController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.get('/child', authorize('parent'), getChildProfile);

export default router;
