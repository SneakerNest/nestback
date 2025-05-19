import { Router } from 'express';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';
import { 
  getAllRefundRequests,
  approveRefundRequest,
  declineRefundRequest
} from '../controllers/refundController.js';

const router = Router();

// Get all refund requests (sales manager only)
router.get('/', 
  authenticateToken, 
  authenticateRole(['salesManager']), 
  getAllRefundRequests
);

// Approve a refund request (sales manager only)
router.put('/:refundID/approve', 
  authenticateToken, 
  authenticateRole(['salesManager']), 
  approveRefundRequest
);

// Decline a refund request (sales manager only)
router.put('/:refundID/decline', 
  authenticateToken, 
  authenticateRole(['salesManager']), 
  declineRefundRequest
);

export default router;