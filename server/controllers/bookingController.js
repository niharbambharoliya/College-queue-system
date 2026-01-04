import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import Counter from '../models/Counter.js';
import Notification from '../models/Notification.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { generateQRCode } from '../utils/qrCodeGenerator.js';
import { checkFakeEnquiry } from '../utils/fakeEnquiryChecker.js';
import { getDateForStorage, getTodayRange, formatDateIST } from '../utils/dateFormatter.js';

/**
 * @desc    Create a new booking
 * @route   POST /api/bookings
 * @access  Private (Student)
 */
export const createBooking = asyncHandler(async (req, res) => {
    const { slotId, counterId, workType, workDescription, date, startTime, endTime } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!slotId || !counterId || !workType) {
        return res.status(400).json({
            success: false,
            message: 'Please provide slotId, counterId, and workType'
        });
    }

    // Check if user account is flagged
    if (req.user.accountStatus === 'flagged') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been flagged. Please contact administration.'
        });
    }

    // Check if slot exists
    const slot = await Slot.findById(slotId);
    if (!slot) {
        return res.status(404).json({
            success: false,
            message: 'Slot not found'
        });
    }

    // Check for duplicate booking by same student for same slot
    const existingBooking = await Booking.findOne({
        studentId,
        slotId,
        status: { $in: ['confirmed', 'pending'] }
    });

    if (existingBooking) {
        return res.status(400).json({
            success: false,
            message: 'You have already booked this slot'
        });
    }

    // Check for any booking at the same time (prevent double-booking)
    const conflictingBooking = await Booking.findOne({
        studentId,
        slotDate: slot.date,
        startTime: slot.startTime,
        status: { $in: ['confirmed', 'pending'] }
    });

    if (conflictingBooking) {
        return res.status(400).json({
            success: false,
            message: 'You already have a booking at this time slot'
        });
    }

    // ATOMIC UPDATE - Race condition prevention
    // Only update if currentBookings < maxCapacity
    const updatedSlot = await Slot.findOneAndUpdate(
        {
            _id: slotId,
            currentBookings: { $lt: slot.maxCapacity }
        },
        {
            $inc: { currentBookings: 1 },
            $push: { bookedStudents: studentId }
        },
        { new: true }
    );

    if (!updatedSlot) {
        return res.status(400).json({
            success: false,
            message: 'Sorry, this slot is now full. Please select another slot.'
        });
    }

    // Get counter details
    const counter = await Counter.findById(counterId);

    // Generate token number for the slot
    const tokenNumber = updatedSlot.currentBookings;

    // Create booking
    const booking = await Booking.create({
        studentId,
        slotId,
        counterId,
        bookingDate: new Date(),
        slotDate: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        workType,
        workDescription: workDescription || '',
        status: 'confirmed',
        isParentRequest: req.user.userType === 'parent',
        tokenNumber
    });

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode({
        bookingId: booking._id,
        time: slot.startTime,
        date: formatDateIST(slot.date, 'YYYY-MM-DD'),
        counterId: counterId,
        studentId: studentId,
        workType: workType,
        tokenNumber
    });

    // Update booking with QR data
    booking.qrCodeData = qrCodeDataUrl;
    await booking.save();

    // Create notification
    await Notification.create({
        userId: studentId,
        notificationType: 'booking_confirmed',
        title: 'Booking Confirmed',
        message: `Your booking at ${counter.counterName} for ${formatDateIST(slot.date, 'DD MMM YYYY')} at ${slot.startTime} has been confirmed. Token #${tokenNumber}`,
        relatedBookingId: booking._id,
        sentVia: ['in-app']
    });

    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        booking: {
            id: booking._id,
            counter: counter.counterName,
            date: formatDateIST(slot.date, 'DD MMM YYYY'),
            startTime: slot.startTime,
            endTime: slot.endTime,
            workType,
            tokenNumber,
            qrCode: qrCodeDataUrl,
            status: 'confirmed'
        }
    });
});

/**
 * @desc    Get current user's bookings
 * @route   GET /api/bookings
 * @access  Private
 */
export const getMyBookings = asyncHandler(async (req, res) => {
    const { status, type } = req.query;
    const userId = req.user.userType === 'parent' ? req.user.linkedStudentId : req.user._id;

    const { startOfDay } = getTodayRange();

    let query = { studentId: userId };

    // Filter by type (upcoming, past, all)
    if (type === 'upcoming') {
        query.slotDate = { $gte: startOfDay };
        query.status = { $in: ['confirmed', 'pending'] };
    } else if (type === 'past' || type === 'history') {
        query.$or = [
            { slotDate: { $lt: startOfDay } },
            { status: { $in: ['completed', 'missed', 'cancelled'] } }
        ];
    }

    // Filter by specific status
    if (status) {
        query.status = status;
    }

    const bookings = await Booking.find(query)
        .populate('counterId', 'counterName counterNumber department')
        .populate('slotId', 'startTime endTime')
        .sort({ slotDate: -1, startTime: -1 });

    const formattedBookings = bookings.map(booking => ({
        id: booking._id,
        counter: booking.counterId?.counterName || 'Unknown',
        counterNumber: booking.counterId?.counterNumber,
        department: booking.counterId?.department,
        date: formatDateIST(booking.slotDate, 'DD MMM YYYY'),
        rawDate: booking.slotDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        workType: booking.workType,
        workDescription: booking.workDescription,
        status: booking.status,
        tokenNumber: booking.tokenNumber,
        qrCode: booking.qrCodeData,
        isParentRequest: booking.isParentRequest,
        createdAt: booking.createdAt
    }));

    // Separate into current and history
    const current = formattedBookings.filter(b =>
        ['confirmed', 'pending'].includes(b.status) && new Date(b.rawDate) >= startOfDay
    );
    const history = formattedBookings.filter(b =>
        !['confirmed', 'pending'].includes(b.status) || new Date(b.rawDate) < startOfDay
    );

    res.status(200).json({
        success: true,
        current,
        history,
        all: formattedBookings
    });
});

/**
 * @desc    Cancel a booking
 * @route   DELETE /api/bookings/:bookingId
 * @access  Private
 */
export const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.userType === 'parent' ? req.user.linkedStudentId : req.user._id;

    const booking = await Booking.findOne({
        _id: bookingId,
        studentId: userId,
        status: { $in: ['confirmed', 'pending'] }
    });

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found or cannot be cancelled'
        });
    }

    // Check if booking is in the past
    const { startOfDay } = getTodayRange();
    if (booking.slotDate < startOfDay) {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel past bookings'
        });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Release slot capacity
    await Slot.findByIdAndUpdate(booking.slotId, {
        $inc: { currentBookings: -1 },
        $pull: { bookedStudents: userId }
    });

    // Check for fake enquiry (only for students, not parents)
    if (req.user.userType === 'student') {
        const result = await checkFakeEnquiry(userId, 'booking_cancelled', {
            slotId: booking.slotId,
            counterId: booking.counterId,
            bookingId: booking._id,
            reason: 'Booking cancelled by user'
        });

        if (result.warningIssued) {
            return res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully',
                warning: 'You have received a warning for excessive cancellations'
            });
        }
    }

    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
    });
});

/**
 * @desc    Get booking by ID
 * @route   GET /api/bookings/:bookingId
 * @access  Private
 */
export const getBookingById = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId)
        .populate('studentId', 'fullName email rollNumber department semester')
        .populate('counterId', 'counterName counterNumber department')
        .populate('slotId', 'startTime endTime');

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    res.status(200).json({
        success: true,
        booking: {
            id: booking._id,
            student: booking.studentId,
            counter: booking.counterId,
            date: formatDateIST(booking.slotDate, 'DD MMM YYYY'),
            startTime: booking.startTime,
            endTime: booking.endTime,
            workType: booking.workType,
            workDescription: booking.workDescription,
            status: booking.status,
            tokenNumber: booking.tokenNumber,
            qrCode: booking.qrCodeData,
            isParentRequest: booking.isParentRequest,
            facultyFeedback: booking.facultyFeedback,
            createdAt: booking.createdAt
        }
    });
});

export default {
    createBooking,
    getMyBookings,
    cancelBooking,
    getBookingById
};
