import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@bvmengineering\.ac\.in$/, 'Please use a valid @bvmengineering.ac.in email']
    },
    password: {
        type: String,
        required: function () {
            return this.userType !== 'parent';
        },
        minlength: 6,
        select: false
    },
    userType: {
        type: String,
        enum: ['student', 'faculty', 'parent'],
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    mobileNumber: {
        type: String,
        required: function () {
            return this.userType === 'parent';
        }
    },
    isVerified: {
        type: Boolean,
        default: true
    },
    accountStatus: {
        type: String,
        enum: ['active', 'flagged', 'suspended'],
        default: 'active'
    },
    // For Parent users
    linkedStudentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return this.userType === 'parent';
        }
    },
    aadhaarNumber: {
        type: String,
        required: function () {
            return this.userType === 'parent';
        },
        match: [/^\d{12}$/, 'Please provide a valid 12-digit Aadhaar number']
    },
    address: {
        type: String,
        required: function () {
            return this.userType === 'parent';
        },
        trim: true
    },
    // For Students
    rollNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    department: {
        type: String
    },
    semester: {
        type: Number,
        min: 1,
        max: 8
    },
    parentContact: {
        name: String,
        email: String,
        mobileNumber: String
    },
    // Warning system for fake enquiries
    fakeEnquiryCount: {
        type: Number,
        default: 0
    },
    lastFakeEnquiryDate: {
        type: Date
    },
    warningStatus: {
        type: String,
        enum: ['none', 'warning_1', 'warning_2'],
        default: 'none'
    },
    warningIssuedDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        next();
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Extract roll number from email for students
userSchema.pre('save', function (next) {
    if (this.userType === 'student' && this.email && !this.rollNumber) {
        this.rollNumber = this.email.split('@')[0].toUpperCase();
    }
    next();
});

const User = mongoose.model('User', userSchema);

export default User;
