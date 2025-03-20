import { Router } from 'express';
import { register, login, listUsers } from '../controllers/authController.js'; 
import { validateRegistration, verifyToken } from '../middleware/validate.js';
import { verifyRole } from '../middleware/role.js';

const router = Router();

router.post('/register', validateRegistration, register);
router.post('/login', login);
router.get('/', verifyToken, verifyRole(['user', 'sales_manager', 'product_manager']), listUsers); 

// Example of a protected route for sales managers
router.get('/sales', verifyToken, verifyRole(['sales_manager']), (req, res) => {
    res.json({ message: 'Welcome Sales Manager' });
});

// Example of a protected route for product managers
router.get('/products', verifyToken, verifyRole(['product_manager']), (req, res) => {
    res.json({ message: 'Welcome Product Manager' });
});

export default router;