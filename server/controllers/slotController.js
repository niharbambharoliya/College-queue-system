import Slot from '../models/Slot.js';
import Counter from '../models/Counter.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { getDateForStorage, getDateRange } from '../utils/dateFormatter.js';
import dayjs from 'dayjs';

// Define time slots (10:00-17:00, excluding 13:00-14:00 lunch)
const TIME_SLOTS = [
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    // Lunch break: 13:00 - 14:00
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' }
];

/**
 * @desc    Get available slots for a counter on a specific date
 * @route   GET /api/slots?counterId=X&date=YYYY-MM-DD
 * @access  Private
 */
export const getAvailableSlots = asyncHandler(async (req, res) => {
    const { counterId, date } = req.query;

    if (!counterId || !date) {
        return res.status(400).json({
            success: false,
            message: 'Please provide counterId and date'
        });
    }

    // Check if counter exists and is active
    const counter = await Counter.findById(counterId);
    if (!counter || !counter.isActive) {
        return res.status(404).json({
            success: false,
            message: 'Counter not found or is inactive'
        });
    }

    // Parse date and get storage format
    const slotDate = getDateForStorage(date);
    const { startOfDay, endOfDay } = getDateRange(date);

    // Check if date is in the past
    const today = getDateForStorage(new Date());
    if (slotDate < today) {
        return res.status(400).json({
            success: false,
            message: 'Cannot view slots for past dates'
        });
    }

    // Get existing slots for this counter and date
    let slots = await Slot.find({
        counterId,
        date: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ startTime: 1 });

    // If no slots exist, create them
    if (slots.length === 0) {
        const newSlots = TIME_SLOTS.map(slot => ({
            counterId,
            date: slotDate,
            startTime: slot.start,
            endTime: slot.end,
            maxCapacity: 10,
            currentBookings: 0,
            bookedStudents: [],
            isActive: true
        }));

        slots = await Slot.insertMany(newSlots);
    }

    // Format response with availability info
    const formattedSlots = slots.map(slot => ({
        id: slot._id,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: slot.maxCapacity,
        currentBookings: slot.currentBookings,
        remainingCapacity: slot.maxCapacity - slot.currentBookings,
        isAvailable: slot.currentBookings < slot.maxCapacity && slot.isActive,
        isFull: slot.currentBookings >= slot.maxCapacity
    }));

    res.status(200).json({
        success: true,
        date: date,
        counter: {
            id: counter._id,
            name: counter.counterName,
            department: counter.department
        },
        slots: formattedSlots
    });
});

/**
 * @desc    Get all slots for a specific date across all counters
 * @route   GET /api/slots/all?date=YYYY-MM-DD
 * @access  Private
 */
export const getAllSlotsForDate = asyncHandler(async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({
            success: false,
            message: 'Please provide date'
        });
    }

    const { startOfDay, endOfDay } = getDateRange(date);
    const slotDate = getDateForStorage(date);

    // Get all active counters
    const counters = await Counter.find({ isActive: true });

    const counterSlots = await Promise.all(
        counters.map(async (counter) => {
            let slots = await Slot.find({
                counterId: counter._id,
                date: { $gte: startOfDay, $lte: endOfDay }
            }).sort({ startTime: 1 });

            // Create slots if they don't exist
            if (slots.length === 0) {
                const newSlots = TIME_SLOTS.map(slot => ({
                    counterId: counter._id,
                    date: slotDate,
                    startTime: slot.start,
                    endTime: slot.end,
                    maxCapacity: 10,
                    currentBookings: 0,
                    bookedStudents: [],
                    isActive: true
                }));

                slots = await Slot.insertMany(newSlots);
            }

            return {
                counter: {
                    id: counter._id,
                    name: counter.counterName,
                    department: counter.department,
                    counterNumber: counter.counterNumber
                },
                slots: slots.map(slot => ({
                    id: slot._id,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    remainingCapacity: slot.maxCapacity - slot.currentBookings,
                    isAvailable: slot.currentBookings < slot.maxCapacity && slot.isActive
                }))
            };
        })
    );

    res.status(200).json({
        success: true,
        date: date,
        counters: counterSlots
    });
});

export default {
    getAvailableSlots,
    getAllSlotsForDate
};
