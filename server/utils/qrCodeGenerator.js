import QRCode from 'qrcode';

/**
 * Generate QR code data URL from booking information
 * @param {Object} bookingData - The booking data to encode
 * @returns {Promise<string>} - Base64 encoded QR code data URL
 */
export const generateQRCode = async (bookingData) => {
    try {
        const qrData = JSON.stringify({
            bookingId: bookingData.bookingId,
            time: bookingData.time,
            date: bookingData.date,
            counterId: bookingData.counterId,
            studentId: bookingData.studentId,
            workType: bookingData.workType,
            tokenNumber: bookingData.tokenNumber
        });

        const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
            margin: 2,
            color: {
                dark: '#1a1a2e',
                light: '#ffffff'
            }
        });

        return qrCodeDataUrl;
    } catch (error) {
        console.error('QR Code generation error:', error);
        throw new Error('Failed to generate QR code');
    }
};

/**
 * Decode QR code data
 * @param {string} qrData - The QR code data string
 * @returns {Object} - Decoded booking data
 */
export const decodeQRCode = (qrData) => {
    try {
        return JSON.parse(qrData);
    } catch (error) {
        throw new Error('Invalid QR code data');
    }
};

export default {
    generateQRCode,
    decodeQRCode
};
