import User from '../models/User.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { isValidBVMEmail, isValidMobile } from '../utils/validators.js';

/**
 * @desc    Login student or faculty
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide email and password'
        });
    }

    if (!isValidBVMEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please use a valid @bvmengineering.ac.in email'
        });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check if user is a parent (parents use credentials login)
    if (user.userType === 'parent') {
        return res.status(400).json({
            success: false,
            message: 'Parents must use the parent login page'
        });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been suspended. Please contact administration.'
        });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
        success: true,
        token,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            userType: user.userType,
            rollNumber: user.rollNumber,
            department: user.department,
            semester: user.semester,
            accountStatus: user.accountStatus,
            warningStatus: user.userType === 'student' ? user.warningStatus : undefined
        }
    });
});

/**
 * @desc    Parent login - credentials based
 * @route   POST /api/auth/parent-login
 * @access  Public
 */
export const parentLogin = asyncHandler(async (req, res) => {
    const { fullName, aadhaarNumber, address, mobileNumber } = req.body;

    // Validate required fields
    if (!fullName || !aadhaarNumber || !address || !mobileNumber) {
        return res.status(400).json({
            success: false,
            message: 'Please provide full name, Aadhaar number, address, and mobile number'
        });
    }

    // Validate mobile number format
    if (!isValidMobile(mobileNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid 10-digit mobile number'
        });
    }

    // Validate Aadhaar number format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid 12-digit Aadhaar number'
        });
    }

    // Find parent by mobile number and Aadhaar number
    const parent = await User.findOne({
        mobileNumber,
        aadhaarNumber,
        userType: 'parent'
    }).populate('linkedStudentId', 'fullName email rollNumber department semester');

    if (!parent) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Please check your details and try again.'
        });
    }

    // Verify full name matches (case-insensitive)
    if (parent.fullName.toLowerCase() !== fullName.toLowerCase().trim()) {
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials. Please check your details and try again.'
        });
    }

    // Check account status
    if (parent.accountStatus === 'suspended') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been suspended. Please contact administration.'
        });
    }

    // Generate token
    const token = generateToken(parent._id);

    res.status(200).json({
        success: true,
        token,
        user: {
            id: parent._id,
            fullName: parent.fullName,
            mobileNumber: parent.mobileNumber,
            aadhaarNumber: parent.aadhaarNumber,
            address: parent.address,
            userType: parent.userType,
            linkedStudent: parent.linkedStudentId
        }
    });
});

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate(
        'linkedStudentId',
        'fullName email rollNumber department semester'
    );

    res.status(200).json({
        success: true,
        user: {
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            userType: user.userType,
            rollNumber: user.rollNumber,
            department: user.department,
            semester: user.semester,
            mobileNumber: user.mobileNumber,
            aadhaarNumber: user.aadhaarNumber,
            address: user.address,
            parentContact: user.parentContact,
            accountStatus: user.accountStatus,
            warningStatus: user.userType === 'student' ? user.warningStatus : undefined,
            linkedStudent: user.linkedStudentId
        }
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    // In a stateless JWT setup, we just respond with success
    // Client should remove the token
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

export default {
    login,
    parentLogin,
    getMe,
    logout
};

