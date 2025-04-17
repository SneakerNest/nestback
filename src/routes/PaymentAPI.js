import { Router } from 'express';
import { processPayment } from '../controllers/paymentController.js';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';
const router = Router();

// Route to handle credit card payment processing
router.post('/process',authenticateToken,authenticateRole(['customer']),processPayment);

export default router;