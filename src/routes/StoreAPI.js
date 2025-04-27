import { Router } from 'express';
import { 
    getProductsByCategory,
    getProductsForCategory, 
    getCategories, 
    getAllProducts,
    getFootwearCategories,
    getSubcategoryProducts, 
    getParentCategoryProducts,
    getProductById
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
    approveReviewComment // Add this import
} from '../controllers/reviewsController.js';

// Import authentication middleware
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

// Import database pool
import { pool } from '../config/database.js';

const router = Router();

// Sample sanity route
router.get('/', (req, res) => {
    return res.send('Store API, welcome!');
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

export default router;


// hi gurl