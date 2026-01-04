import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notificationType: {
        type: String,
        enum: ['pre_booking_alert', 'capacity_alert', 'emergency_alert', 'warning_alert', 'system_alert', 'booking_confirmed', 'booking_cancelled', 'emergency_approved', 'emergency_rejected'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    relatedEmergencyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmergencyQueue'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    sentVia: [{
        type: String,
        enum: ['email', 'sms', 'in-app']
    }],
    sentAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
