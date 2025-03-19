import { Router } from 'express';
import { register, login, listUsers } from '../controllers/authController.js'; 
import { validateRegistration, verifyToken } from '../middleware/validate.js';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.get('/', listUsers); 

export default router;