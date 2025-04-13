import { Router } from 'express';
import { getProducts, createProduct } from '../controllers/productController.js';
import { verifyToken, isProductManager } from '../middleware/validateAuth.js';
import { validateProductCreation } from '../middleware/validateProduct.js';

const router = Router();

// Public route: Get all products
router.get('/', getProducts);

// Product manager route: Create a new product
router.post('/', verifyToken, isProductManager, validateProductCreation, createProduct);

export default router;
