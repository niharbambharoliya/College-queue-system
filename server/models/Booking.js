import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    slotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Slot',
        required: true
    },
    counterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counter',
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    slotDate: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    workType: {
        type: String,
        required: true,
        enum: ['Admission', 'Scholarship', 'Document Verification', 'Fees Payment', 'Certificate Collection', 'General Enquiry', 'Other']
    },
    workDescription: {
        type: String,
        default: ''
    },
    qrCodeData: {
        type: String
    },
    status: {
        type: String,
        enum: ['confirmed', 'completed', 'missed', 'cancelled', 'pending'],
        default: 'confirmed'
    },
    isParentRequest: {
        type: Boolean,
        default: false
    },
    facultyFeedback: {
        markedAt: Date,
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        action: {
            type: String,
            enum: ['completed', 'missed']
        },
        notes: String
    },
    tokenNumber: {
        type: Number
    }
}, {
    timestamps: true
});

// Index for efficient queries
bookingSchema.index({ studentId: 1, slotDate: 1 });
bookingSchema.index({ counterId: 1, slotDate: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ slotDate: 1, status: 1 });

// Pre-save middleware to generate QR code data
bookingSchema.pre('save', function (next) {
    if (!this.qrCodeData) {
        this.qrCodeData = JSON.stringify({
            bookingId: this._id,
            time: this.startTime,
            date: this.slotDate,
            counterId: this.counterId,
            studentId: this.studentId,
            workType: this.workType
        });
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
