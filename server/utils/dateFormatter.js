import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Convert a date to UTC for storage
 * @param {Date|string} date - The date to convert
 * @returns {Date} - UTC date
 */
export const toUTC = (date) => {
    return dayjs(date).utc().toDate();
};

/**
 * Convert a UTC date to IST for display
 * @param {Date|string} date - The UTC date to convert
 * @returns {dayjs.Dayjs} - Dayjs object in IST
 */
export const toIST = (date) => {
    return dayjs(date).tz(IST_TIMEZONE);
};

/**
 * Format date for display in IST
 * @param {Date|string} date - The date to format
 * @param {string} format - The format string (default: 'DD MMM YYYY')
 * @returns {string} - Formatted date string
 */
export const formatDateIST = (date, format = 'DD MMM YYYY') => {
    return toIST(date).format(format);
};

/**
 * Format time for display in IST
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted time string (HH:mm)
 */
export const formatTimeIST = (date) => {
    return toIST(date).format('HH:mm');
};

/**
 * Get today's date range in UTC (for database queries)
 * @returns {Object} - { startOfDay, endOfDay } in UTC
 */
export const getTodayRange = () => {
    const startOfDayIST = dayjs().tz(IST_TIMEZONE).startOf('day');
    const endOfDayIST = dayjs().tz(IST_TIMEZONE).endOf('day');

    return {
        startOfDay: startOfDayIST.utc().toDate(),
        endOfDay: endOfDayIST.utc().toDate()
    };
};

/**
 * Get a specific date's range in UTC
 * @param {Date|string} date - The date
 * @returns {Object} - { startOfDay, endOfDay } in UTC
 */
export const getDateRange = (date) => {
    const dateIST = dayjs(date).tz(IST_TIMEZONE);
    const startOfDayIST = dateIST.startOf('day');
    const endOfDayIST = dateIST.endOf('day');

    return {
        startOfDay: startOfDayIST.utc().toDate(),
        endOfDay: endOfDayIST.utc().toDate()
    };
};

/**
 * Check if a date is today in IST
 * @param {Date|string} date - The date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
    const dateIST = dayjs(date).tz(IST_TIMEZONE);
    const todayIST = dayjs().tz(IST_TIMEZONE);
    return dateIST.isSame(todayIST, 'day');
};

/**
 * Check if a date is in the past
 * @param {Date|string} date - The date to check
 * @returns {boolean}
 */
export const isPast = (date) => {
    const dateIST = dayjs(date).tz(IST_TIMEZONE);
    const todayIST = dayjs().tz(IST_TIMEZONE).startOf('day');
    return dateIST.isBefore(todayIST, 'day');
};

/**
 * Check if a date is in the future
 * @param {Date|string} date - The date to check
 * @returns {boolean}
 */
export const isFuture = (date) => {
    const dateIST = dayjs(date).tz(IST_TIMEZONE);
    const todayIST = dayjs().tz(IST_TIMEZONE).startOf('day');
    return dateIST.isAfter(todayIST, 'day');
};

/**
 * Get the start of day in UTC for a given date (stored as 00:00:00 for date matching)
 * @param {Date|string} date - The date
 * @returns {Date} - Start of day in UTC
 */
export const getDateForStorage = (date) => {
    return dayjs(date).tz(IST_TIMEZONE).startOf('day').utc().toDate();
};

/**
 * Get current time in IST
 * @returns {string} - Current time in HH:mm format
 */
export const getCurrentTimeIST = () => {
    return dayjs().tz(IST_TIMEZONE).format('HH:mm');
};

/**
 * Check if current time is past a given time (in HH:mm format)
 * @param {string} time - Time in HH:mm format
 * @returns {boolean}
 */
export const isTimePast = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const now = dayjs().tz(IST_TIMEZONE);
    const compareTime = now.hour(hours).minute(minutes).second(0);
    return now.isAfter(compareTime);
};

export default {
    toUTC,
    toIST,
    formatDateIST,
    formatTimeIST,
    getTodayRange,
    getDateRange,
    isToday,
    isPast,
    isFuture,
    getDateForStorage,
    getCurrentTimeIST,
    isTimePast
};
