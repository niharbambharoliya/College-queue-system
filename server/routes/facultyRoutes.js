import express from 'express';
import { getTodayBookings, getUpcomingBookings, getPastBookings, markCompleted, markMissed, scanQR, getDashboardStats } from '../controllers/facultyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('faculty'));

router.get('/dashboard-stats', getDashboardStats);
router.get('/today-bookings', getTodayBookings);
router.get('/upcoming-bookings', getUpcomingBookings);
router.get('/past-bookings', getPastBookings);
router.post('/mark-completed/:bookingId', markCompleted);
router.post('/mark-missed/:bookingId', markMissed);
router.post('/scan-qr', scanQR);

export default router;
