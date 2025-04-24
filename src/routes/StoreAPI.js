import { Router } from 'express';
import { 
    getProductsByCategory,
    getProductsForCategory, 
    getCategories, 
    getAllProducts,
    getFootwearCategories,
    getSubcategoryProducts, 
    getParentCategoryProducts,
    getProductById // Add this import
} from '../controllers/productController.js';

const router = Router();

// Product category routes
//router.get('/categories', getCategories); //Useless 
//router.get('/products/by-category', getProductsByCategory); //Useless
router.get('/products/category/:categoryId', getProductsForCategory);//Get Products for Specific SubCategory
router.get('/products', getAllProducts);//gets all products for main page
router.get('/footwear-categories', getFootwearCategories);//gets all footwear categories
router.get('/categories/:parentId/subcategories', getSubcategoryProducts); //Get Subcategory Products for parent category
router.get('/categories/:parentId/all-products', getParentCategoryProducts);//Useful

// Add this new route
router.get('/products/:productId', getProductById); // Get specific product details

export default router;