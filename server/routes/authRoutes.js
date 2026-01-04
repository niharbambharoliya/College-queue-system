import express from 'express';
import { login, parentLogin, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/parent-login', parentLogin);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;
