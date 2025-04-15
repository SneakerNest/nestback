import { Router } from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile, deleteUser } from '../controllers/user.js';
import { authenticateToken } from '../middleware/auth-handler.js';

const router = Router();

// Basic routes - no authentication needed
router.get('/', (req, res) => {
  res.send('User API, welcome!');
});

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes - require authentication
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.delete('/profile', authenticateToken, deleteUser);

export default router;