import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
    counterNumber: {
        type: Number,
        required: true,
        unique: true
    },
    counterName: {
        type: String,
        required: [true, 'Counter name is required'],
        trim: true
    },
    department: {
        type: String,
        required: true,
        enum: ['Admissions', 'Scholarships', 'Document Verification', 'Fees', 'General Enquiry']
    },
    operatingHours: {
        startTime: {
            type: String,
            default: '10:00'
        },
        endTime: {
            type: String,
            default: '17:00'
        },
        lunchStart: {
            type: String,
            default: '13:00'
        },
        lunchEnd: {
            type: String,
            default: '14:00'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    assignedFaculty: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;
