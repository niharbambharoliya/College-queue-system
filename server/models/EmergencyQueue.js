import mongoose from 'mongoose';

const emergencyQueueSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    counterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counter',
        required: true
    },
    requestedDate: {
        type: Date,
        required: true
    },
    requestedTime: {
        type: String,
        required: true
    },
    deadline: {
        type: String,
        required: [true, 'Please specify your deadline']
    },
    proofDocument: {
        type: String,
        required: [true, 'Please upload proof of deadline']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'auto_rejected'],
        default: 'pending'
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    respondedAt: {
        type: Date
    },
    respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String
    },
    autoRejectedReason: {
        type: String
    },
    workType: {
        type: String,
        required: true,
        enum: ['Emergency Document', 'Urgent Scholarship Issue', 'Deadline Submission', 'Other Emergency']
    },
    description: {
        type: String,
        required: [true, 'Please describe your emergency']
    },
    // If approved, link to the created booking
    approvedBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }
}, {
    timestamps: true
});

// Index for efficient queries
emergencyQueueSchema.index({ status: 1, requestedDate: 1 });
emergencyQueueSchema.index({ studentId: 1 });
emergencyQueueSchema.index({ counterId: 1, status: 1 });

const EmergencyQueue = mongoose.model('EmergencyQueue', emergencyQueueSchema);

export default EmergencyQueue;
