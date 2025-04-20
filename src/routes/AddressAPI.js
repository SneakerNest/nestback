import { Router } from 'express';
import {
  getAddress,
  getUserAddress,
  getPersonalAddress,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addressController.js';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

const router = Router();

// Sanity check route
router.get('/', (req, res) => {
    res.send('Address API, welcome!');
});

// Public routes
router.get('/id/:addressid', authenticateToken, getAddress);

// Protected routes with role authentication
router.get('/uname/:username', authenticateToken, authenticateRole(['productManager']), getUserAddress);
router.get('/personal', authenticateToken, authenticateRole(['customer']), getPersonalAddress);

// Address management routes
router.post('/newaddress', authenticateToken, createAddress);
router.put('/:addressid', authenticateToken, updateAddress);
router.delete('/:addressid', authenticateToken, deleteAddress);

export default router;