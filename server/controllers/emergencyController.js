import EmergencyQueue from '../models/EmergencyQueue.js';
import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import Counter from '../models/Counter.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { getDateForStorage, formatDateIST, getCurrentTimeIST, isTimePast } from '../utils/dateFormatter.js';
import { generateQRCode } from '../utils/qrCodeGenerator.js';

/**
 * @desc    Create emergency queue request
 * @route   POST /api/emergency-queue
 * @access  Private (Student)
 */
export const createEmergencyRequest = asyncHandler(async (req, res) => {
    const { counterId, requestedDate, requestedTime, deadline, workType, description } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!counterId || !requestedDate || !deadline || !workType || !description) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields'
        });
    }

    // Check if user account is flagged
    if (req.user.accountStatus === 'flagged') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been flagged. Please contact administration.'
        });
    }

    // Check for proof document (uploaded via multer)
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Please upload proof of deadline'
        });
    }

    // Check if counter exists
    const counter = await Counter.findById(counterId);
    if (!counter || !counter.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Counter not found or inactive'
        });
    }

    // Check for existing pending emergency request
    const existingRequest = await EmergencyQueue.findOne({
        studentId,
        status: 'pending'
    });

    if (existingRequest) {
        return res.status(400).json({
            success: false,
            message: 'You already have a pending emergency request'
        });
    }

    // Create emergency request
    const emergencyRequest = await EmergencyQueue.create({
        studentId,
        counterId,
        requestedDate: getDateForStorage(requestedDate),
        requestedTime: requestedTime || '10:00',
        deadline,
        proofDocument: `/uploads/${req.file.filename}`,
        workType,
        description,
        status: 'pending'
    });

    // Notify all faculty assigned to this counter
    const facultyUsers = await User.find({
        userType: 'faculty',
        _id: { $in: counter.assignedFaculty }
    });

    // Create notifications for faculty
    for (const faculty of facultyUsers) {
        await Notification.create({
            userId: faculty._id,
            notificationType: 'emergency_alert',
            title: 'New Emergency Request',
            message: `Student ${req.user.fullName} has submitted an emergency request for ${counter.counterName}. Deadline: ${deadline}`,
            relatedEmergencyId: emergencyRequest._id,
            sentVia: ['in-app']
        });
    }

    // If no faculty assigned, notify all faculty
    if (facultyUsers.length === 0) {
        const allFaculty = await User.find({ userType: 'faculty' });
        for (const faculty of allFaculty) {
            await Notification.create({
                userId: faculty._id,
                notificationType: 'emergency_alert',
                title: 'New Emergency Request',
                message: `Student ${req.user.fullName} has submitted an emergency request for ${counter.counterName}. Deadline: ${deadline}`,
                relatedEmergencyId: emergencyRequest._id,
                sentVia: ['in-app']
            });
        }
    }

    console.log(`[EMERGENCY ALERT] New request from ${req.user.fullName} for ${counter.counterName}`);

    res.status(201).json({
        success: true,
        message: 'Emergency request submitted successfully. Faculty will be notified.',
        request: {
            id: emergencyRequest._id,
            counter: counter.counterName,
            requestedDate: formatDateIST(emergencyRequest.requestedDate, 'DD MMM YYYY'),
            deadline,
            status: 'pending'
        }
    });
});

/**
 * @desc    Get pending emergency requests (Faculty)
 * @route   GET /api/emergency-queue/pending
 * @access  Private (Faculty)
 */
export const getPendingRequests = asyncHandler(async (req, res) => {
    const { counterId } = req.query;

    let query = { status: 'pending' };
    if (counterId) {
        query.counterId = counterId;
    }

    const requests = await EmergencyQueue.find(query)
        .populate('studentId', 'fullName email rollNumber department semester mobileNumber')
        .populate('counterId', 'counterName counterNumber department')
        .sort({ requestedAt: 1 });

    const formattedRequests = requests.map(request => ({
        id: request._id,
        student: {
            id: request.studentId?._id,
            name: request.studentId?.fullName,
            email: request.studentId?.email,
            rollNumber: request.studentId?.rollNumber,
            department: request.studentId?.department,
            mobile: request.studentId?.mobileNumber
        },
        counter: {
            id: request.counterId?._id,
            name: request.counterId?.counterName,
            number: request.counterId?.counterNumber
        },
        requestedDate: formatDateIST(request.requestedDate, 'DD MMM YYYY'),
        requestedTime: request.requestedTime,
        deadline: request.deadline,
        workType: request.workType,
        description: request.description,
        proofDocument: request.proofDocument,
        status: request.status,
        requestedAt: request.requestedAt
    }));

    res.status(200).json({
        success: true,
        count: formattedRequests.length,
        requests: formattedRequests
    });
});

/**
 * @desc    Approve emergency request
 * @route   POST /api/emergency-queue/:requestId/approve
 * @access  Private (Faculty)
 */
export const approveRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { slotTime, notes } = req.body;

    const request = await EmergencyQueue.findById(requestId)
        .populate('studentId', 'fullName email')
        .populate('counterId', 'counterName counterNumber');

    if (!request) {
        return res.status(404).json({
            success: false,
            message: 'Emergency request not found'
        });
    }

    if (request.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: 'Request has already been processed'
        });
    }

    // Find or create a slot for the emergency
    const slotDate = request.requestedDate;
    const startTime = slotTime || request.requestedTime;

    let slot = await Slot.findOne({
        counterId: request.counterId._id,
        date: slotDate,
        startTime
    });

    // Create the slot if it doesn't exist
    if (!slot) {
        const endHour = parseInt(startTime.split(':')[0]) + 1;
        slot = await Slot.create({
            counterId: request.counterId._id,
            date: slotDate,
            startTime,
            endTime: `${endHour.toString().padStart(2, '0')}:00`,
            maxCapacity: 10,
            currentBookings: 0,
            isActive: true
        });
    }

    // Create emergency booking
    const tokenNumber = slot.currentBookings + 1;

    const booking = await Booking.create({
        studentId: request.studentId._id,
        slotId: slot._id,
        counterId: request.counterId._id,
        bookingDate: new Date(),
        slotDate: request.requestedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        workType: request.workType,
        workDescription: `Emergency: ${request.description}`,
        status: 'confirmed',
        tokenNumber
    });

    // Update slot
    await Slot.findByIdAndUpdate(slot._id, {
        $inc: { currentBookings: 1 },
        $push: { bookedStudents: request.studentId._id }
    });

    // Generate QR code
    const qrCodeDataUrl = await generateQRCode({
        bookingId: booking._id,
        time: slot.startTime,
        date: formatDateIST(slotDate, 'YYYY-MM-DD'),
        counterId: request.counterId._id,
        studentId: request.studentId._id,
        workType: request.workType,
        tokenNumber
    });

    booking.qrCodeData = qrCodeDataUrl;
    await booking.save();

    // Update emergency request
    request.status = 'approved';
    request.respondedAt = new Date();
    request.respondedBy = req.user._id;
    request.approvedBookingId = booking._id;
    await request.save();

    // Notify student
    await Notification.create({
        userId: request.studentId._id,
        notificationType: 'emergency_approved',
        title: 'Emergency Request Approved',
        message: `Your emergency request has been approved. Your appointment is at ${slot.startTime} on ${formatDateIST(slotDate, 'DD MMM YYYY')} at ${request.counterId.counterName}. Token #${tokenNumber}`,
        relatedEmergencyId: request._id,
        relatedBookingId: booking._id,
        sentVia: ['in-app', 'email']
    });

    console.log(`[EMERGENCY APPROVED] Request ${requestId} approved by ${req.user.fullName}`);

    res.status(200).json({
        success: true,
        message: 'Emergency request approved',
        booking: {
            id: booking._id,
            date: formatDateIST(slotDate, 'DD MMM YYYY'),
            time: slot.startTime,
            tokenNumber
        }
    });
});

/**
 * @desc    Reject emergency request
 * @route   POST /api/emergency-queue/:requestId/reject
 * @access  Private (Faculty)
 */
export const rejectRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;

    if (!reason) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a reason for rejection'
        });
    }

    const request = await EmergencyQueue.findById(requestId)
        .populate('studentId', 'fullName')
        .populate('counterId', 'counterName');

    if (!request) {
        return res.status(404).json({
            success: false,
            message: 'Emergency request not found'
        });
    }

    if (request.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: 'Request has already been processed'
        });
    }

    request.status = 'rejected';
    request.respondedAt = new Date();
    request.respondedBy = req.user._id;
    request.rejectionReason = reason;
    await request.save();

    // Notify student
    await Notification.create({
        userId: request.studentId._id,
        notificationType: 'emergency_rejected',
        title: 'Emergency Request Rejected',
        message: `Your emergency request for ${request.counterId.counterName} has been rejected. Reason: ${reason}`,
        relatedEmergencyId: request._id,
        sentVia: ['in-app']
    });

    res.status(200).json({
        success: true,
        message: 'Emergency request rejected'
    });
});

/**
 * @desc    Get student's emergency requests
 * @route   GET /api/emergency-queue/my-requests
 * @access  Private (Student)
 */
export const getMyRequests = asyncHandler(async (req, res) => {
    const studentId = req.user._id;

    const requests = await EmergencyQueue.find({ studentId })
        .populate('counterId', 'counterName counterNumber')
        .populate('approvedBookingId', 'tokenNumber qrCodeData')
        .sort({ requestedAt: -1 });

    const formattedRequests = requests.map(request => ({
        id: request._id,
        counter: request.counterId?.counterName,
        requestedDate: formatDateIST(request.requestedDate, 'DD MMM YYYY'),
        deadline: request.deadline,
        workType: request.workType,
        description: request.description,
        status: request.status,
        rejectionReason: request.rejectionReason,
        autoRejectedReason: request.autoRejectedReason,
        booking: request.approvedBookingId,
        requestedAt: request.requestedAt,
        respondedAt: request.respondedAt
    }));

    res.status(200).json({
        success: true,
        requests: formattedRequests
    });
});

/**
 * @desc    Auto-reject pending requests at 5 PM
 * This should be called via cron job
 */
export const autoRejectPendingRequests = async () => {
    const currentTime = getCurrentTimeIST();

    // Only run at 5 PM (17:00)
    if (!isTimePast('17:00')) {
        return;
    }

    const pendingRequests = await EmergencyQueue.find({
        status: 'pending',
        requestedDate: { $lte: new Date() }
    }).populate('studentId', 'fullName');

    for (const request of pendingRequests) {
        request.status = 'auto_rejected';
        request.autoRejectedReason = 'Counter closing time reached (5:00 PM)';
        request.respondedAt = new Date();
        await request.save();

        // Notify student
        await Notification.create({
            userId: request.studentId._id,
            notificationType: 'emergency_rejected',
            title: 'Emergency Request Auto-Rejected',
            message: 'Your emergency request was automatically rejected as the counter closing time was reached.',
            relatedEmergencyId: request._id,
            sentVia: ['in-app']
        });

        console.log(`[AUTO-REJECT] Emergency request ${request._id} auto-rejected at 5 PM`);
    }

    return pendingRequests.length;
};

export default {
    createEmergencyRequest,
    getPendingRequests,
    approveRequest,
    rejectRequest,
    getMyRequests,
    autoRejectPendingRequests
};
