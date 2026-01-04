import Booking from '../models/Booking.js';
import Counter from '../models/Counter.js';
import EmergencyQueue from '../models/EmergencyQueue.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { getTodayRange, getDateRange, formatDateIST } from '../utils/dateFormatter.js';
import { decodeQRCode } from '../utils/qrCodeGenerator.js';

/**
 * @desc    Get today's bookings for faculty
 * @route   GET /api/faculty/today-bookings
 * @access  Private (Faculty)
 */
export const getTodayBookings = asyncHandler(async (req, res) => {
    const { counterId } = req.query;
    const { startOfDay, endOfDay } = getTodayRange();

    let query = {
        slotDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['confirmed', 'pending', 'completed', 'missed'] }
    };

    // If counterId provided, filter by counter
    if (counterId) {
        query.counterId = counterId;
    }

    const bookings = await Booking.find(query)
        .populate('studentId', 'fullName email rollNumber department semester mobileNumber')
        .populate('counterId', 'counterName counterNumber department')
        .sort({ startTime: 1, tokenNumber: 1 });

    const formattedBookings = bookings.map(booking => ({
        id: booking._id,
        student: {
            id: booking.studentId?._id,
            name: booking.studentId?.fullName,
            email: booking.studentId?.email,
            rollNumber: booking.studentId?.rollNumber,
            department: booking.studentId?.department,
            semester: booking.studentId?.semester,
            mobile: booking.studentId?.mobileNumber
        },
        counter: {
            id: booking.counterId?._id,
            name: booking.counterId?.counterName,
            number: booking.counterId?.counterNumber,
            department: booking.counterId?.department
        },
        date: formatDateIST(booking.slotDate, 'DD MMM YYYY'),
        startTime: booking.startTime,
        endTime: booking.endTime,
        workType: booking.workType,
        workDescription: booking.workDescription,
        status: booking.status,
        tokenNumber: booking.tokenNumber,
        isParentRequest: booking.isParentRequest,
        facultyFeedback: booking.facultyFeedback
    }));

    // Group by time slots
    const groupedByTime = {};
    formattedBookings.forEach(booking => {
        const timeKey = `${booking.startTime} - ${booking.endTime}`;
        if (!groupedByTime[timeKey]) {
            groupedByTime[timeKey] = [];
        }
        groupedByTime[timeKey].push(booking);
    });

    res.status(200).json({
        success: true,
        date: formatDateIST(new Date(), 'DD MMM YYYY'),
        totalBookings: formattedBookings.length,
        bookings: formattedBookings,
        groupedByTime
    });
});

/**
 * @desc    Get upcoming bookings for faculty
 * @route   GET /api/faculty/upcoming-bookings
 * @access  Private (Faculty)
 */
export const getUpcomingBookings = asyncHandler(async (req, res) => {
    const { counterId, days = 7 } = req.query;
    const { endOfDay } = getTodayRange();

    // Get bookings for next N days
    const endDate = new Date(endOfDay);
    endDate.setDate(endDate.getDate() + parseInt(days));

    let query = {
        slotDate: { $gt: endOfDay, $lte: endDate },
        status: { $in: ['confirmed', 'pending'] }
    };

    if (counterId) {
        query.counterId = counterId;
    }

    const bookings = await Booking.find(query)
        .populate('studentId', 'fullName email rollNumber department')
        .populate('counterId', 'counterName counterNumber department')
        .sort({ slotDate: 1, startTime: 1 });

    const formattedBookings = bookings.map(booking => ({
        id: booking._id,
        student: {
            name: booking.studentId?.fullName,
            rollNumber: booking.studentId?.rollNumber,
            department: booking.studentId?.department
        },
        counter: booking.counterId?.counterName,
        date: formatDateIST(booking.slotDate, 'DD MMM YYYY'),
        startTime: booking.startTime,
        endTime: booking.endTime,
        workType: booking.workType,
        status: booking.status,
        tokenNumber: booking.tokenNumber
    }));

    // Group by date
    const groupedByDate = {};
    formattedBookings.forEach(booking => {
        if (!groupedByDate[booking.date]) {
            groupedByDate[booking.date] = [];
        }
        groupedByDate[booking.date].push(booking);
    });

    res.status(200).json({
        success: true,
        totalBookings: formattedBookings.length,
        bookings: formattedBookings,
        groupedByDate
    });
});

/**
 * @desc    Get past bookings for faculty
 * @route   GET /api/faculty/past-bookings
 * @access  Private (Faculty)
 */
export const getPastBookings = asyncHandler(async (req, res) => {
    const { counterId, days = 30, page = 1, limit = 20 } = req.query;
    const { startOfDay } = getTodayRange();

    // Get bookings for past N days
    const startDate = new Date(startOfDay);
    startDate.setDate(startDate.getDate() - parseInt(days));

    let query = {
        slotDate: { $gte: startDate, $lt: startOfDay }
    };

    if (counterId) {
        query.counterId = counterId;
    }

    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
        .populate('studentId', 'fullName rollNumber department')
        .populate('counterId', 'counterName counterNumber')
        .sort({ slotDate: -1, startTime: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const formattedBookings = bookings.map(booking => ({
        id: booking._id,
        student: {
            name: booking.studentId?.fullName,
            rollNumber: booking.studentId?.rollNumber
        },
        counter: booking.counterId?.counterName,
        date: formatDateIST(booking.slotDate, 'DD MMM YYYY'),
        startTime: booking.startTime,
        workType: booking.workType,
        status: booking.status,
        tokenNumber: booking.tokenNumber,
        facultyFeedback: booking.facultyFeedback
    }));

    res.status(200).json({
        success: true,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        bookings: formattedBookings
    });
});

/**
 * @desc    Mark booking as completed
 * @route   POST /api/faculty/mark-completed/:bookingId
 * @access  Private (Faculty)
 */
export const markCompleted = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    if (booking.status === 'completed') {
        return res.status(400).json({
            success: false,
            message: 'Booking is already marked as completed'
        });
    }

    booking.status = 'completed';
    booking.facultyFeedback = {
        markedAt: new Date(),
        markedBy: req.user._id,
        action: 'completed',
        notes: notes || ''
    };

    await booking.save();

    res.status(200).json({
        success: true,
        message: 'Booking marked as completed',
        booking: {
            id: booking._id,
            status: booking.status,
            facultyFeedback: booking.facultyFeedback
        }
    });
});

/**
 * @desc    Mark booking as missed
 * @route   POST /api/faculty/mark-missed/:bookingId
 * @access  Private (Faculty)
 */
export const markMissed = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { notes } = req.body;

    const booking = await Booking.findById(bookingId)
        .populate('studentId', 'fullName');

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    if (booking.status === 'missed') {
        return res.status(400).json({
            success: false,
            message: 'Booking is already marked as missed'
        });
    }

    booking.status = 'missed';
    booking.facultyFeedback = {
        markedAt: new Date(),
        markedBy: req.user._id,
        action: 'missed',
        notes: notes || ''
    };

    await booking.save();

    // This counts towards fake enquiry for the student
    const { checkFakeEnquiry } = await import('../utils/fakeEnquiryChecker.js');
    await checkFakeEnquiry(booking.studentId._id, 'slot_skipped', {
        slotId: booking.slotId,
        counterId: booking.counterId,
        bookingId: booking._id,
        reason: 'Student did not show up for appointment'
    });

    res.status(200).json({
        success: true,
        message: 'Booking marked as missed',
        booking: {
            id: booking._id,
            status: booking.status,
            facultyFeedback: booking.facultyFeedback
        }
    });
});

/**
 * @desc    Scan and verify QR code
 * @route   POST /api/faculty/scan-qr
 * @access  Private (Faculty)
 */
export const scanQR = asyncHandler(async (req, res) => {
    const { qrData } = req.body;

    if (!qrData) {
        return res.status(400).json({
            success: false,
            message: 'Please provide QR code data'
        });
    }

    let decodedData;
    try {
        decodedData = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Invalid QR code format'
        });
    }

    const { bookingId } = decodedData;

    if (!bookingId) {
        return res.status(400).json({
            success: false,
            message: 'Invalid QR code - booking ID not found'
        });
    }

    const booking = await Booking.findById(bookingId)
        .populate('studentId', 'fullName email rollNumber department semester mobileNumber')
        .populate('counterId', 'counterName counterNumber department');

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    res.status(200).json({
        success: true,
        verified: true,
        booking: {
            id: booking._id,
            student: {
                id: booking.studentId?._id,
                name: booking.studentId?.fullName,
                email: booking.studentId?.email,
                rollNumber: booking.studentId?.rollNumber,
                department: booking.studentId?.department,
                semester: booking.studentId?.semester,
                mobile: booking.studentId?.mobileNumber
            },
            counter: {
                name: booking.counterId?.counterName,
                number: booking.counterId?.counterNumber
            },
            date: formatDateIST(booking.slotDate, 'DD MMM YYYY'),
            startTime: booking.startTime,
            endTime: booking.endTime,
            workType: booking.workType,
            workDescription: booking.workDescription,
            status: booking.status,
            tokenNumber: booking.tokenNumber,
            isParentRequest: booking.isParentRequest
        }
    });
});

/**
 * @desc    Get dashboard stats for faculty
 * @route   GET /api/faculty/dashboard-stats
 * @access  Private (Faculty)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const { startOfDay, endOfDay } = getTodayRange();

    // Today's bookings count
    const todayTotal = await Booking.countDocuments({
        slotDate: { $gte: startOfDay, $lte: endOfDay }
    });

    const todayCompleted = await Booking.countDocuments({
        slotDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'completed'
    });

    const todayMissed = await Booking.countDocuments({
        slotDate: { $gte: startOfDay, $lte: endOfDay },
        status: 'missed'
    });

    const todayPending = await Booking.countDocuments({
        slotDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['confirmed', 'pending'] }
    });

    // Pending emergency requests
    const pendingEmergencies = await EmergencyQueue.countDocuments({
        status: 'pending'
    });

    // Counters overview
    const counters = await Counter.find({ isActive: true });

    res.status(200).json({
        success: true,
        stats: {
            today: {
                total: todayTotal,
                completed: todayCompleted,
                missed: todayMissed,
                pending: todayPending
            },
            pendingEmergencies,
            activeCounters: counters.length
        }
    });
});

export default {
    getTodayBookings,
    getUpcomingBookings,
    getPastBookings,
    markCompleted,
    markMissed,
    scanQR,
    getDashboardStats
};
