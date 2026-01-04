import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema({
    counterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Counter',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
    },
    endTime: {
        type: String,
        required: true,
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
    },
    maxCapacity: {
        type: Number,
        default: 10
    },
    currentBookings: {
        type: Number,
        default: 0
    },
    bookedStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for efficient querying
slotSchema.index({ counterId: 1, date: 1, startTime: 1 }, { unique: true });
slotSchema.index({ date: 1 });

// Virtual for remaining capacity
slotSchema.virtual('remainingCapacity').get(function () {
    return this.maxCapacity - this.currentBookings;
});

// Ensure virtuals are included in JSON
slotSchema.set('toJSON', { virtuals: true });
slotSchema.set('toObject', { virtuals: true });

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;
