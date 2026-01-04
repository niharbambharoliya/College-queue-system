import express from 'express';
import { createBooking, getMyBookings, cancelBooking, getBookingById } from '../controllers/bookingController.js';
import { protect, authorize, checkAccountStatus } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('student', 'parent'), checkAccountStatus, createBooking);
router.get('/', protect, getMyBookings);
router.get('/:bookingId', protect, getBookingById);
router.delete('/:bookingId', protect, authorize('student', 'parent'), cancelBooking);

export default router;
