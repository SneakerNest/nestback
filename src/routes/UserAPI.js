import { Router } from 'express';
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

export default router;