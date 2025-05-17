import { Router } from 'express';
import { pool } from '../config/database.js';
import {
  getOrder,
  getOrdersByDateRange,
  getUserOrders,
  getSupplierOrders,
  getPurchasePrice,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderItems,
  getOrderDataWrapper,
  deleteOrderItem,
  getAllOrder,
  getUserActiveOrders,
  getUserPastOrders,
  getUserCancelledOrders
} from '../controllers/orderController.js';

import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';
import { processReturn, getCustomerReturns, approveReturn, rejectReturn } from '../controllers/returnController.js';

const router = Router();

// Add this route for direct testing - place it before other routes
router.get('/returns/customer/:customerID', async (req, res) => {
  try {
    const { customerID } = req.params;
    console.log(`Direct check for returns by customer ID: ${customerID}`);
    
    const [detailedReturns] = await pool.query(
      `SELECT 
        r.requestID,
        r.returnStatus,
        r.reason,
        r.orderID,
        r.productID,
        r.quantity,
        r.customerID,
        o.orderNumber,
        p.name AS productName,
        COALESCE(smr.approvalStatus, 'pending') AS approvalStatus
       FROM Returns r
       LEFT JOIN \`Order\` o ON r.orderID = o.orderID
       LEFT JOIN Product p ON r.productID = p.productID
       LEFT JOIN SalesManagerApprovesRefundReturn smr ON r.requestID = smr.requestID
       WHERE r.customerID = ?
       ORDER BY r.requestID DESC`,
      [customerID]
    );
    
    return res.status(200).json(detailedReturns);
  } catch (error) {
    return res.status(500).json({ message: 'Error checking returns', error: error.message });
  }
});

// General Routes
router.get('/active', authenticateToken, getUserActiveOrders); // This should come first
router.get('/past', authenticateToken, getUserPastOrders);
router.get('/cancelled', authenticateToken, getUserCancelledOrders);
router.get('/user/me/orders', authenticateToken, getUserOrders); // This should come first
router.get('/', authenticateToken, getAllOrder);
router.get('/:id', authenticateToken, getOrder);
router.post('/daterange', authenticateToken, getOrdersByDateRange);
router.get('/:orderid/product/:productid/purchase-price', authenticateToken, getPurchasePrice);

// Supplier-specific route
router.get('/supplier/me/orders', authenticateToken, authenticateRole(['productManager', 'salesManager']), getSupplierOrders);

// Order Creation & Updates
router.post('/place', authenticateToken, createOrder);
router.put('/:id', authenticateToken, updateOrder);
router.put('/:id/items', authenticateToken, updateOrderItems);
router.put('/cancel/:id', authenticateToken, cancelOrder);
router.delete('/:orderid/product/:productid', authenticateToken, deleteOrderItem);

// Return Routes
router.post('/return', authenticateToken, processReturn);
router.get('/returns', authenticateToken, getCustomerReturns);

// Sales Manager Return Approval Routes
router.put('/return/:requestID/approve', authenticateToken, authenticateRole(['salesManager']), approveReturn);
router.put('/return/:requestID/reject', authenticateToken, authenticateRole(['salesManager']), rejectReturn);
export default router;