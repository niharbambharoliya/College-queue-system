import express from 'express';
import { getCounters, getCounterById, getDepartments } from '../controllers/counterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getCounters);
router.get('/departments', getDepartments);
router.get('/:counterId', getCounterById);

export default router;
