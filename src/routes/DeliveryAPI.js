import { Router } from 'express';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';
import { 
    getEstimatedTimeById,
    updateEstimatedTime,
    getOrderByCourierId,
    getOrderById,
    updateDeliveryStatus,
    getDeliveryStatus 
} from '../controllers/deliveryController.js';

const router = Router();

// Sample sanity route
router.get('/', (req, res) => {
    res.send('Delivery API, welcome!');
});

// Protected routes
router.get('/estimate/:id', authenticateToken, getEstimatedTimeById);

router.put('/estimate/:id', authenticateToken, updateEstimatedTime);

router.get('/order/courier/:courierid', authenticateToken, getOrderByCourierId);

router.get('/order/:id', authenticateToken, getOrderById);

router.put('/order/:id/status', authenticateToken, updateDeliveryStatus);

router.get('/order/:id/status', authenticateToken, getDeliveryStatus);

export default router;