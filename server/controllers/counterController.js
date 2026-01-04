import Counter from '../models/Counter.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

export const getCounters = asyncHandler(async (req, res) => {
    const { department, active } = req.query;
    let query = {};
    if (department) query.department = department;
    if (active !== undefined) query.isActive = active === 'true';

    const counters = await Counter.find(query)
        .populate('assignedFaculty', 'fullName email')
        .sort({ counterNumber: 1 });

    res.json({
        success: true,
        count: counters.length,
        counters: counters.map(c => ({
            id: c._id, counterNumber: c.counterNumber, name: c.counterName,
            department: c.department, description: c.description,
            operatingHours: c.operatingHours, isActive: c.isActive,
            assignedFaculty: c.assignedFaculty
        }))
    });
});

export const getCounterById = asyncHandler(async (req, res) => {
    const counter = await Counter.findById(req.params.counterId)
        .populate('assignedFaculty', 'fullName email');
    if (!counter) return res.status(404).json({ success: false, message: 'Counter not found' });
    res.json({ success: true, counter });
});

export const getDepartments = asyncHandler(async (req, res) => {
    const departments = await Counter.distinct('department');
    res.json({ success: true, departments });
});

export default { getCounters, getCounterById, getDepartments };
