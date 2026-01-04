/**
 * Email validator
 * @param {string} email - The email to validate
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * BVM email validator
 * @param {string} email - The email to validate
 * @returns {boolean}
 */
export const isValidBVMEmail = (email) => {
    const bvmEmailRegex = /^[^\s@]+@bvmengineering\.ac\.in$/;
    return bvmEmailRegex.test(email);
};

/**
 * Mobile number validator (Indian format)
 * @param {string} mobile - The mobile number to validate
 * @returns {boolean}
 */
export const isValidMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
};

/**
 * Time format validator (HH:MM)
 * @param {string} time - The time to validate
 * @returns {boolean}
 */
export const isValidTimeFormat = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

/**
 * Check if time is within operating hours (10:00 - 17:00, excluding 13:00-14:00 lunch)
 * @param {string} time - The time in HH:MM format
 * @returns {boolean}
 */
export const isWithinOperatingHours = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    const startMinutes = 10 * 60; // 10:00
    const endMinutes = 17 * 60; // 17:00
    const lunchStartMinutes = 13 * 60; // 13:00
    const lunchEndMinutes = 14 * 60; // 14:00

    if (totalMinutes < startMinutes || totalMinutes >= endMinutes) {
        return false;
    }

    if (totalMinutes >= lunchStartMinutes && totalMinutes < lunchEndMinutes) {
        return false;
    }

    return true;
};

/**
 * Validate required fields in an object
 * @param {Object} obj - The object to validate
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} - { isValid, missingFields }
 */
export const validateRequiredFields = (obj, requiredFields) => {
    const missingFields = requiredFields.filter(field => {
        const value = obj[field];
        return value === undefined || value === null || value === '';
    });

    return {
        isValid: missingFields.length === 0,
        missingFields
    };
};

/**
 * Sanitize string input
 * @param {string} str - The string to sanitize
 * @returns {string}
 */
export const sanitizeString = (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
};

/**
 * Validate date format and check if it's a valid future date
 * @param {string} dateStr - The date string
 * @returns {Object} - { isValid, error }
 */
export const isValidFutureDate = (dateStr) => {
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Invalid date format' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
        return { isValid: false, error: 'Date cannot be in the past' };
    }

    return { isValid: true, error: null };
};

export default {
    isValidEmail,
    isValidBVMEmail,
    isValidMobile,
    isValidTimeFormat,
    isWithinOperatingHours,
    validateRequiredFields,
    sanitizeString,
    isValidFutureDate
};
