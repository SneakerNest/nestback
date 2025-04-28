import { Router } from 'express';
import { pool } from '../config/database.js';  // Add this import
import { 
    registerUser, 
    loginUser, 
    getUserProfile, 
    updateUserProfile, 
    deleteUser 
} from '../controllers/userController.js';
import {
    getBillingInfo,
    getBillingInfoById,
    createBillingInfo,
    updateBillingInfo,
    deleteBillingInfo
} from '../controllers/billingController.js';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

const router = Router();

// Sanity check route
router.get('/', (req, res) => {
    res.send('User API, welcome!');
});

// User Registration, login, and profile management
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, authenticateRole(['customer']), getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.delete('/removeuser', authenticateToken, deleteUser);

// User billingInfo management
router.get('/billing', authenticateToken, authenticateRole(['customer']), getBillingInfo);
router.get('/billing/:id', authenticateToken, authenticateRole(['customer']), getBillingInfoById);
router.post('/billing', authenticateToken, authenticateRole(['customer']), createBillingInfo);
router.put('/billing/:id', authenticateToken, authenticateRole(['customer']), updateBillingInfo);
router.delete('/billing/:id', authenticateToken, authenticateRole(['customer']), deleteBillingInfo);

// Fetch customer by username
router.get('/customer/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Fetching customer ID for username:', username); // Debug log

    const [rows] = await pool.query(
      'SELECT customerID FROM Customer WHERE username = ?',
      [username]
    );

    console.log('Query result:', rows); // Debug log

    if (rows.length === 0) {
      console.log('No customer found for username:', username); // Debug log
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({ customerID: rows[0].customerID });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;