import { Router } from 'express';
import { 
    getProductsByCategory,
    getProductsForCategory,
    getCategories,
    getAllProducts,
    getFootwearCategories,
    getSubcategoryProducts,
    getParentCategoryProducts
} from '../controllers/productController.js';
import { getProductsByCategory as orderGetProductsByCategory, placeOrder } from '../controllers/orderController.js';

const router = Router();

// Product category routes
router.get('/categories', getCategories);
router.get('/products/by-category', getProductsByCategory);
router.get('/products/category/:categoryId', getProductsForCategory);
router.get('/products', getAllProducts);
router.get('/footwear-categories', getFootwearCategories);
router.get('/categories/:parentId/subcategories', getSubcategoryProducts);
router.get('/categories/:parentId/all-products', getParentCategoryProducts);

// Order routes
router.get('/products/categories', orderGetProductsByCategory);
router.post('/order', placeOrder);

export default router;