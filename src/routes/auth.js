import {Router} from 'express';


// Middleware
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

const router = Router();
// Controllers
import { registerCustomer, loginUser, getUserProfile, updateUserProfile, deleteUser } from '../controllers/authController.js';

// Routes
router.get('/', (req, res) => {
  res.send('User API, welcome!');
});

// User Registration, Login, and Profile Management
router.post('/register', (req, res) => {
  return registerCustomer(req, res);
});

router.post('/login', (req, res) => {
  return loginUser(req, res);
});

router.get('/profile', authenticateToken, authenticateRole('customer'), (req, res) => {
  return getUserProfile(req, res);
});

router.put('/profile', authenticateToken, (req, res) => {
  return updateUserProfile(req, res);
});

router.delete('/removeuser', authenticateToken, (req, res) => {
  return deleteUser(req, res);
});

export default router;
