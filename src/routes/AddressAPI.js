import { Router } from 'express';
import {
  getAddress,
  getUserAddress,
  getPersonalAddress,
  createAddress,
  updateAddress,
  deleteAddress
} from '../controllers/addressController.js';
import { authenticateToken } from '../middleware/auth-handler.js';

const router = Router();

router.get('/:addressid', getAddress); // Public
router.get('/user/:username', getUserAddress); // Public
router.get('/personal/me', authenticateToken, getPersonalAddress); // Needs token
router.post('/', authenticateToken, createAddress); // Must be logged in to create
router.put('/:addressid', authenticateToken, updateAddress); // Only owner can update
router.delete('/:addressid', authenticateToken, deleteAddress); // Only owner can delete

export default router;