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

// Add this import for the database connection
import { pool } from '../config/database.js';

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

// Only product managers can update order status
router.put('/order/:id/status', 
    authenticateToken, 
    authenticateRole(['productManager']), 
    updateDeliveryStatus
);

router.get('/order/:id/status', authenticateToken, getDeliveryStatus);

// Add this route to get all deliveries with full information
router.get('/all', async (req, res) => {
  try {
    // Get all orders with delivery information
    const [orders] = await pool.query(`
      SELECT 
        o.orderID,
        o.orderNumber,
        o.deliveryID,
        o.customerID,
        o.totalPrice,
        o.deliveryStatus,
        o.deliveryAddressID,
        o.estimatedArrival,
        o.timeOrdered,
        c.username,
        u.name as customerName,
        u.email as customerEmail
      FROM \`Order\` o
      LEFT JOIN Customer c ON o.customerID = c.customerID
      LEFT JOIN USERS u ON c.username = u.username
      ORDER BY o.timeOrdered DESC
    `);
    
    // Enhance each order with delivery address and products
    const enhancedOrders = await Promise.all(orders.map(async (order) => {
      // Get address info
      const [addressInfo] = await pool.query(
        'SELECT * FROM Address WHERE addressID = ?',
        [order.deliveryAddressID]
      );
      
      // Get product info
      const [products] = await pool.query(`
        SELECT 
          oi.productID,
          p.name,
          oi.quantity,
          oi.purchasePrice
        FROM OrderOrderItemsProduct oi
        JOIN Product p ON oi.productID = p.productID
        WHERE oi.orderID = ?
      `, [order.orderID]);
      
      return {
        ...order,
        deliveryAddress: addressInfo.length > 0 ? addressInfo[0] : null,
        products: products,
        // Format the date for easier display
        orderDate: new Date(order.timeOrdered).toLocaleDateString()
      };
    }));
    
    res.status(200).json(enhancedOrders);
  } catch (error) {
    console.error('Error fetching delivery data:', error);
    res.status(500).json({ message: 'Error fetching delivery data', error: error.message });
  }
});

export default router;