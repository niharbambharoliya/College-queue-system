import express from 'express';
import multer from 'multer';
import path from 'path';
import { createEmergencyRequest, getPendingRequests, approveRequest, rejectRequest, getMyRequests } from '../controllers/emergencyController.js';
import { protect, authorize, checkAccountStatus } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'emergency-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|pdf/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
});

router.post('/', protect, authorize('student'), checkAccountStatus, upload.single('proofDocument'), createEmergencyRequest);
router.get('/my-requests', protect, authorize('student'), getMyRequests);
router.get('/pending', protect, authorize('faculty'), getPendingRequests);
router.post('/:requestId/approve', protect, authorize('faculty'), approveRequest);
router.post('/:requestId/reject', protect, authorize('faculty'), rejectRequest);

export default router;
