import User from '../models/User.js';
import FakeEnquiryLog from '../models/FakeEnquiryLog.js';
import Notification from '../models/Notification.js';
import dayjs from 'dayjs';

const FAKE_ENQUIRY_THRESHOLD = 5;
const FAKE_ENQUIRY_WINDOW_HOURS = 24;

/**
 * Log a fake enquiry action
 * @param {string} userId - The user ID
 * @param {string} action - The action type
 * @param {Object} details - Additional details
 */
export const logFakeEnquiry = async (userId, action, details = {}) => {
    try {
        await FakeEnquiryLog.create({
            userId,
            action,
            details
        });
    } catch (error) {
        console.error('Error logging fake enquiry:', error);
    }
};

/**
 * Check and update fake enquiry count for a user
 * @param {string} userId - The user ID
 * @param {string} action - The action type
 * @param {Object} details - Additional details
 * @returns {Object} - { shouldFlag, warningIssued, currentCount }
 */
export const checkFakeEnquiry = async (userId, action, details = {}) => {
    try {
        const user = await User.findById(userId);
        if (!user || user.userType !== 'student') {
            return { shouldFlag: false, warningIssued: false, currentCount: 0 };
        }

        const windowStart = dayjs().subtract(FAKE_ENQUIRY_WINDOW_HOURS, 'hours').toDate();

        // Count recent fake enquiries
        const recentCount = await FakeEnquiryLog.countDocuments({
            userId,
            timestamp: { $gte: windowStart }
        });

        // Log this enquiry
        await logFakeEnquiry(userId, action, details);

        const newCount = recentCount + 1;

        // Check if threshold reached
        if (newCount >= FAKE_ENQUIRY_THRESHOLD) {
            // Update user warning status
            let newWarningStatus = 'warning_1';
            if (user.warningStatus === 'warning_1') {
                newWarningStatus = 'warning_2';
            } else if (user.warningStatus === 'warning_2') {
                // Flag the account
                user.accountStatus = 'flagged';
                await user.save();

                // Create warning notification
                await createWarningNotification(userId, 'account_flagged');

                return { shouldFlag: true, warningIssued: true, currentCount: newCount };
            }

            user.warningStatus = newWarningStatus;
            user.warningIssuedDate = new Date();
            user.fakeEnquiryCount = newCount;
            await user.save();

            // Create warning notification
            await createWarningNotification(userId, newWarningStatus);

            return { shouldFlag: false, warningIssued: true, currentCount: newCount };
        }

        // Update fake enquiry count
        user.fakeEnquiryCount = newCount;
        user.lastFakeEnquiryDate = new Date();
        await user.save();

        return { shouldFlag: false, warningIssued: false, currentCount: newCount };
    } catch (error) {
        console.error('Error checking fake enquiry:', error);
        return { shouldFlag: false, warningIssued: false, currentCount: 0 };
    }
};

/**
 * Create a warning notification for the user
 * @param {string} userId - The user ID
 * @param {string} warningType - The type of warning
 */
const createWarningNotification = async (userId, warningType) => {
    const messages = {
        warning_1: {
            title: 'Warning: Excessive Cancellations',
            message: 'You have made multiple cancellations recently. Please book slots only when you intend to attend. Further violations may result in account restrictions.'
        },
        warning_2: {
            title: 'Final Warning: Account at Risk',
            message: 'This is your final warning. You have repeatedly violated booking policies. One more violation will result in account suspension.'
        },
        account_flagged: {
            title: 'Account Flagged',
            message: 'Your account has been flagged due to repeated policy violations. Please contact the administration to resolve this issue.'
        }
    };

    const msg = messages[warningType] || messages.warning_1;

    try {
        await Notification.create({
            userId,
            notificationType: 'warning_alert',
            title: msg.title,
            message: msg.message,
            sentVia: ['in-app', 'email']
        });

        // Log to console (simulating email/SMS)
        console.log(`[WARNING NOTIFICATION] Sent to user ${userId}:`, msg);
    } catch (error) {
        console.error('Error creating warning notification:', error);
    }
};

/**
 * Reset fake enquiry count for a user (admin action)
 * @param {string} userId - The user ID
 */
export const resetFakeEnquiryCount = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, {
            fakeEnquiryCount: 0,
            warningStatus: 'none',
            accountStatus: 'active'
        });
    } catch (error) {
        console.error('Error resetting fake enquiry count:', error);
    }
};

export default {
    logFakeEnquiry,
    checkFakeEnquiry,
    resetFakeEnquiryCount
};
