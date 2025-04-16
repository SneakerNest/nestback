import { Router } from 'express';
import {  getProductsByCategory,getProductsForCategory, getCategories, getAllProducts,getFootwearCategories,getSubcategoryProducts, getParentCategoryProducts} from '../controllers/productController.js';

const router = Router();

// Product category routes
router.get('/categories', getCategories);
router.get('/products/by-category', getProductsByCategory);
router.get('/products/category/:categoryId', getProductsForCategory);
router.get('/products', getAllProducts);
router.get('/footwear-categories', getFootwearCategories);
router.get('/categories/:parentId/subcategories', getSubcategoryProducts);
router.get('/categories/:parentId/all-products', getParentCategoryProducts);


export default router;