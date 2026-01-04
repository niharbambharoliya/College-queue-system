import express from 'express';
import { getAvailableSlots, getAllSlotsForDate } from '../controllers/slotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAvailableSlots);
router.get('/all', protect, getAllSlotsForDate);

export default router;
