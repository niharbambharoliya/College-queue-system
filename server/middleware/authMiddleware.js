import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.accountStatus === 'suspended') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended. Please contact administration.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

/**
 * Authorize specific roles
 * @param  {...string} roles - Roles allowed to access the route
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.userType}' is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Check if account is not flagged
 */
export const checkAccountStatus = async (req, res, next) => {
    if (req.user.accountStatus === 'flagged') {
        return res.status(403).json({
            success: false,
            message: 'Your account has been flagged. Please contact administration to resolve this issue.'
        });
    }
    next();
};

/**
 * Generate JWT Token
 * @param {string} id - User ID
 * @returns {string} - JWT Token
 */
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '24h'
    });
};

export default {
    protect,
    authorize,
    checkAccountStatus,
    generateToken
};
