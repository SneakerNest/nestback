import { Router } from 'express';
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
  getOrderWrapper,
  deleteOrderItem,
  getAllOrder
} from '../controllers/orderController.js';

import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

const router = Router();

// General Routes
router.get('/', authenticateToken, getAllOrder);
router.get('/:id', authenticateToken, getOrder);
router.get('/user/me/orders', authenticateToken, getUserOrders);
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

export default router;