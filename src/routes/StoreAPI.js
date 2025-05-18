import { Router } from 'express';
import { 
    getProductsByCategory,
    getProductsForCategory, 
    getCategories, 
    getAllProducts,
    getFootwearCategories,
    getSubcategoryProducts, 
    getParentCategoryProducts,
    getProductById,
    getProductCategory,
    updateProductStock,
    createPendingProduct,
    getPendingProducts,
    approveProduct,
    deleteProduct
} from '../controllers/productController.js';

// Import review controller
import {
    getAllReviews,
    getApprovedReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
    getPendingReviews,
    getOverallRatingById,
    getAllPendingReviews,
    approveReviewComment
} from '../controllers/reviewsController.js';

// Import authentication middleware
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

// Import database pool
import { pool } from '../config/database.js';

// Import category controller - only category-specific functions
import {
    createCategory,
    deleteCategory
} from '../controllers/categoryController.js';

// Update the category route to handle file uploads
import multer from 'multer';

// Don't forget to add these imports at the top
import path from 'path';
import fs from 'fs';

// Add these imports at the top of the file
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = Router();

// Sample sanity route
router.get('/', (req, res) => {
    return res.send('Store API, welcome!');
});

// Update the image serving route to properly check all possible paths

router.get('/images/:imageName', (req, res) => {
  const { imageName } = req.params;
  console.log(`Image request for: ${imageName}`);
  
  // Define all possible image paths to check - add extra options for Docker paths
  const pathsToCheck = [
    // Standard paths in Docker container
    path.join(__dirname, '../../public/uploads', imageName),
    path.join(__dirname, '../../public/uploads/categories', imageName),
    path.join(__dirname, '../../public/uploads/products', imageName),
    path.join(__dirname, '../../assets/images', imageName),
    // Root level assets path
    path.join(__dirname, '../../../assets/images', imageName),
    // Absolute path in Docker container
    '/usr/src/app/assets/images/' + imageName,
    // Try nestback path explicitly
    '/usr/src/app/nestback/assets/images/' + imageName
  ];
  
  console.log('Checking paths for image:', pathsToCheck);
  
  // Try each path in order
  for (const imagePath of pathsToCheck) {
    console.log(`Checking path: ${imagePath}`);
    if (fs.existsSync(imagePath)) {
      console.log(`Found image at: ${imagePath}`);
      return res.sendFile(imagePath);
    }
  }
  
  console.log(`Image not found: ${imageName}`);
  return res.status(404).json({ message: 'Image not found' });
});

// Add this debug route

router.get('/debug/image-paths/:imageName', (req, res) => {
  const { imageName } = req.params;
  const pathsToCheck = [
    path.join(__dirname, '../../public/uploads', imageName),
    path.join(__dirname, '../../public/uploads/categories', imageName),
    path.join(__dirname, '../../public/uploads/products', imageName),
    path.join(__dirname, '../../assets/images', imageName)
  ];
  
  const results = pathsToCheck.map(path => ({
    path,
    exists: fs.existsSync(path)
  }));
  
  res.status(200).json({
    imageName,
    pathsChecked: results
  });
});

// Product category routes
router.get('/products/category/:categoryId', (req, res) => {
    return getProductsForCategory(req, res);
});

router.get('/products', (req, res) => {
    return getAllProducts(req, res);
});

router.get('/footwear-categories', (req, res) => {
    return getFootwearCategories(req, res);
});

router.get('/categories/:parentId/subcategories', (req, res) => {
    return getSubcategoryProducts(req, res);
});

router.get('/categories/:parentId/all-products', (req, res) => {
    return getParentCategoryProducts(req, res);
});

router.get('/products/:productId', (req, res) => {
    return getProductById(req, res);
});

// Add this route
router.get('/product/:productId/category', getProductCategory);

// Add this route with the other product routes
router.put('/products/:productId/stock', 
  authenticateToken, 
  authenticateRole(['productManager']), 
  updateProductStock
);

// ===== CATEGORY MANAGEMENT ROUTES =====

// Category management with image upload
router.post('/categories', 
  authenticateToken, 
  authenticateRole(['productManager']), 
  upload.single('image'), // Add this middleware to handle image upload
  createCategory
);

router.delete('/categories/:id', authenticateToken, authenticateRole(['productManager']), deleteCategory);

// ===== PENDING PRODUCTS ROUTES =====

// Pending products
router.post('/products/pending', authenticateToken, authenticateRole(['productManager']), createPendingProduct);
router.get('/products/pending', authenticateToken, authenticateRole(['productManager', 'salesManager']), getPendingProducts);

// For sales managers to set prices
router.put('/products/pending/:id/approve', authenticateToken, authenticateRole(['salesManager']), approveProduct);

// ===== REVIEW ROUTES =====

// Public review routes - no authentication required
// Get all reviews for a product
router.get('/product/:id/reviews', (req, res) => {
    return getAllReviews(req, res);
});

// Get approved reviews for a product
router.get('/product/:id/reviews/approved', (req, res) => {
    return getApprovedReviews(req, res);
});

// Get a specific review
router.get('/product/:id/reviews/:reviewId', (req, res) => {
    return getReviewById(req, res);
});

// Get overall rating for a product
router.get('/reviews/overallRating/:productID', (req, res) => {
    return getOverallRatingById(req, res);
});

// Protected review routes - customer role
// Create a review (requires customer authentication)
router.post('/product/:id/reviews', authenticateToken, authenticateRole('customer'), (req, res) => {
    return createReview(req, res);
});

// Update a review (requires authentication)
router.put('/product/:id/reviews/:reviewId', authenticateToken, (req, res) => {
    return updateReview(req, res);
});

// Alternative route for updating a review
router.put('/reviews/:reviewId', authenticateToken, (req, res) => {
    return updateReview(req, res);
});

// Delete a review (requires authentication)
router.delete('/reviews/:reviewId', authenticateToken, (req, res) => {
    return deleteReview(req, res);
});

// Product manager specific routes
router.get('/reviews/pending/:productManagerUsername', authenticateToken, authenticateRole('productManager'), (req, res) => {
    return getPendingReviews(req, res);
});

// Get all pending reviews (product manager only)
router.get('/reviews/pending', 
    authenticateToken, 
    authenticateRole(['productManager']), 
    (req, res) => {
        return getAllPendingReviews(req, res);
});

// Approve review comment (product manager only)
router.put('/reviews/:reviewId/approve', 
    authenticateToken, 
    authenticateRole(['productManager']), 
    (req, res) => {
        return approveReviewComment(req, res);
});

// ===== CUSTOMER AND USER ROUTES =====

// Get customer details by ID
router.get('/customers/:id', async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT c.customerID, c.username, u.name 
       FROM Customer c 
       JOIN USERS u ON c.username = u.username 
       WHERE c.customerID = ?`,
      [req.params.id]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer data' });
  }
});

// Get user details by username
router.get('/users/:username', async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT username, name, email FROM USERS WHERE username = ?',
      [req.params.username]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user data' });
  }
});

// Add this right after your existing routes
router.get('/debug-categories', async (req, res) => {
  try {
    // Direct database query to bypass any logic errors
    const [categories] = await pool.query('SELECT * FROM Category');
    
    // Log what's in the database
    console.log('DEBUG - Raw categories in database:', categories);
    
    return res.status(200).json({
      count: categories.length,
      rawData: categories
    });
  } catch (error) {
    console.error('Error in debug-categories route:', error);
    return res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// Add a direct route to get all categories
router.get('/categories', (req, res) => {
    return getCategories(req, res);
});

export default router;