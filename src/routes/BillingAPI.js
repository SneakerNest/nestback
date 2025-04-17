import { Router } from 'express';
import {getBillingInfo,getBillingInfoById,createBillingInfo,updateBillingInfo,deleteBillingInfo} from '../controllers/billingController.js';
import { authenticateToken } from '../middleware/auth-handler.js';
const router = Router();

router.get('/', authenticateToken, getBillingInfo);
router.get('/:id', authenticateToken, getBillingInfoById);
router.post('/', authenticateToken, createBillingInfo);
router.put('/:id', authenticateToken, updateBillingInfo);
router.delete('/:id', authenticateToken, deleteBillingInfo);



export default router;