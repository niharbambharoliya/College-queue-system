import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

export const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('linkedStudentId', 'fullName email rollNumber department semester');

    res.json({
        success: true,
        profile: {
            id: user._id, email: user.email, fullName: user.fullName, userType: user.userType,
            rollNumber: user.rollNumber, department: user.department, semester: user.semester,
            mobileNumber: user.mobileNumber, parentContact: user.parentContact,
            accountStatus: user.accountStatus,
            warningStatus: user.userType === 'student' ? user.warningStatus : undefined,
            linkedStudent: user.linkedStudentId
        }
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { fullName, mobileNumber, department, semester, parentContact } = req.body;
    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (mobileNumber) updates.mobileNumber = mobileNumber;
    if (department && req.user.userType === 'student') updates.department = department;
    if (semester && req.user.userType === 'student') updates.semester = semester;
    if (parentContact && req.user.userType === 'student') updates.parentContact = parentContact;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', profile: user });
});

export const getChildProfile = asyncHandler(async (req, res) => {
    if (req.user.userType !== 'parent') {
        return res.status(403).json({ success: false, message: 'Only parents can access this' });
    }
    const child = await User.findById(req.user.linkedStudentId);
    if (!child) return res.status(404).json({ success: false, message: 'Linked student not found' });

    res.json({
        success: true,
        child: {
            id: child._id, fullName: child.fullName, email: child.email, rollNumber: child.rollNumber,
            department: child.department, semester: child.semester, accountStatus: child.accountStatus,
            warningStatus: child.warningStatus
        }
    });
});

export default { getProfile, updateProfile, getChildProfile };
