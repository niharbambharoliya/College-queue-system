import mongoose from 'mongoose';

const fakeEnquiryLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        enum: ['booking_cancelled', 'slot_skipped', 'false_emergency'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    details: {
        slotId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Slot'
        },
        counterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Counter'
        },
        bookingId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        reason: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
fakeEnquiryLogSchema.index({ userId: 1, timestamp: -1 });
fakeEnquiryLogSchema.index({ userId: 1, action: 1 });

const FakeEnquiryLog = mongoose.model('FakeEnquiryLog', fakeEnquiryLogSchema);

export default FakeEnquiryLog;
