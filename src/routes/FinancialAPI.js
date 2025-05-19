import { Router } from 'express';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';
import { getFinancialReport } from '../controllers/financialController.js';

const router = Router();

// Sample sanity route
router.get('/', (req, res) => {
    res.send('Financial API, welcome!');
});

// Protected routes
router.post('/report', 
    authenticateToken, 
    authenticateRole(['salesManager', 'admin']), 
    getFinancialReport
);

export default router;