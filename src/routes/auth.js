import { Router } from 'express';
import { register, login, listUsers } from '../controllers/authController.js'; 
import { validateRegistration, verifyToken, isSalesManager, isProductManager } from '../middleware/validate.js';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.get('/', listUsers); 

// Example of role-based access control
router.get('/sales-manager-data', verifyToken, isSalesManager, (req, res) => {
    // Only sales managers can access this route
    res.json({ message: 'Sales manager data' });
});
  
router.get('/product-manager-data', verifyToken, isProductManager, (req, res) => {
    // Only product managers can access this route
    res.json({ message: 'Product manager data' });
});

export default router;