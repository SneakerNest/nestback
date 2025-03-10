import { Router } from 'express';
import { register, login, getAllUsers  } from '../controllers/authController.js';
import { validateRegistration } from '../middleware/validate.js';

const router = Router();

// Auth Routes POST
router.post('/login', login);
router.post('/register', validateRegistration, register);

// User Routes GET
router.get('/', getAllUsers);

export default router;
