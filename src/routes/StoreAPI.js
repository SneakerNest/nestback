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

// Make sure this import exists at the top of the file
import { sendWishlistDiscountNotifications } from '../controllers/notificationController.js';

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
    '/usr/src/app/nestback/assets/images/' + imageName,
    // Add more paths if needed
    '/usr/src/app/public/uploads/products/' + imageName
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
  return res.status(404).sendFile(path.join(__dirname, '../../assets/images/placeholder.jpg'));
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

// Add this new endpoint to get product category and images

router.get('/product/:productID/category', async (req, res) => {
  try {
    const { productID } = req.params;
    const [categoryResult] = await pool.query(`
      SELECT c.name as categoryName 
      FROM Category c
      JOIN CategoryCategorizesProduct ccp ON c.categoryID = ccp.categoryID
      WHERE ccp.productID = ?
      LIMIT 1
    `, [productID]);
    
    return res.status(200).json({ 
      categoryName: categoryResult.length > 0 ? categoryResult[0].categoryName : 'Uncategorized' 
    });
  } catch (error) {
    console.error('Error getting product category:', error);
    return res.status(500).json({ message: 'Error getting product category' });
  }
});

router.get('/product/:productID/images', async (req, res) => {
  try {
    const { productID } = req.params;
    const [picturesResult] = await pool.query(`
      SELECT picturePath FROM Pictures WHERE productID = ?
    `, [productID]);
    
    return res.status(200).json({
      pictures: picturesResult.map(pic => pic.picturePath)
    });
  } catch (error) {
    console.error('Error getting product images:', error);
    return res.status(500).json({ message: 'Error getting product images' });
  }
});

// Add this new route for updating product prices (add near the other product routes)

// Update product price and discount
router.put('/products/:id/price', 
  authenticateToken, 
  authenticateRole(['salesManager']), 
  async (req, res) => {
    try {
      const productId = req.params.id;
      const { price, discountPercentage } = req.body;
      
      console.log('Updating product price:', {
        productId,
        price,
        discountPercentage,
        username: req.username
      });
      
      // Validate inputs
      if (isNaN(price) || price <= 0) {
        return res.status(400).json({ message: 'Price must be a positive number' });
      }
      
      if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ message: 'Discount percentage must be between 0 and 100' });
      }
      
      // Update price in database directly
      const [updateResult] = await pool.query(
        'UPDATE Product SET unitPrice = ?, discountPercentage = ? WHERE productID = ?',
        [price, discountPercentage, productId]
      );
      
      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Log the sales manager's price update in the SalesManagerManagesPriceProduct table
      await pool.query(
        'INSERT INTO SalesManagerManagesPriceProduct (salesManagerUsername, productID, newPrice, discountPercent) VALUES (?, ?, ?, ?)',
        [req.username, productId, price, discountPercentage]
      );
      
      // If a discount was applied, automatically send notifications
      if (discountPercentage > 0) {
        try {
          // Import the sendDiscountNotifications function
          const { sendDiscountNotifications } = await import('../Services/discountNotifier.js');
          
          // Call it directly
          const notifyResult = await sendDiscountNotifications(productId, discountPercentage, price);
          console.log('Notification result:', notifyResult);
          
          return res.status(200).json({
            message: 'Product price updated successfully',
            productId: productId,
            newPrice: price,
            newDiscountPercentage: discountPercentage,
            notificationsSent: notifyResult.sent || 0
          });
        } catch (notifyError) {
          console.error('Error sending discount notifications:', notifyError);
          return res.status(200).json({
            message: 'Product price updated successfully, but notification failed',
            productId: productId,
            newPrice: price,
            newDiscountPercentage: discountPercentage,
            notificationError: notifyError.message
          });
        }
      }
      
      return res.status(200).json({
        message: 'Product price updated successfully',
        productId: productId,
        newPrice: price,
        newDiscountPercentage: discountPercentage
      });
    } catch (error) {
      console.error('Error updating product price:', error);
      return res.status(500).json({ message: 'Error updating product price', error: error.message });
    }
  }
);

// Add this route to notify discounts
router.post('/products/notify-discount', 
  authenticateToken, 
  authenticateRole(['salesManager']), 
  sendWishlistDiscountNotifications
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
router.get('/products/pending', getPendingProducts);

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

// Add this debugging route - no authentication required
router.get('/debug/pending-products', async (req, res) => {
  try {
    // Direct database query bypassing authentication
    const [products] = await pool.query('SELECT * FROM Product WHERE unitPrice < 0.01');
    
    // Log what's in the database
    console.log('DEBUG - Raw pending products in database:', products);
    
    return res.status(200).json({
      count: products.length,
      rawData: products
    });
  } catch (error) {
    console.error('Error in debug-pending route:', error);
    return res.status(500).json({ 
      message: 'Error fetching pending products', 
      error: error.message 
    });
  }
});

// Add this new route specifically for pending products deletion

// Update the debug endpoint for pending product deletion

router.delete('/debug/pending-products/:id', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    
    console.log(`EMERGENCY DELETE: Attempting to delete pending product ID ${id}`);
    
    await connection.beginTransaction();
    
    // Force deletion with direct SQL query and disabled checks
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    
    // Delete from ALL possible tables (comprehensive list)
    const tables = [
      'ReviewDiscussesProduct',
      'SalesManagerManagesPriceProduct',
      'ProductManagerRestocksProduct',
      'CategoryCategorizesProduct',
      'Pictures',
      'CartContainsProduct',
      'WishlistItems',
      'OrderOrderItemsProduct',
      'Returns',
      'CustomerViewsProduct',
      'ProductAttributes'
    ];
    
    // Try to delete from all potential tables
    for (const table of tables) {
      try {
        await connection.query(`DELETE FROM ${table} WHERE productID = ?`, [id]);
        console.log(`Deleted product references from ${table}`);
      } catch (tableError) {
        console.log(`Table ${table} might not exist or no entries found, continuing deletion`);
      }
    }
    
    // Finally delete the product itself
    await connection.query('DELETE FROM Product WHERE productID = ?', [id]);
    
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    await connection.commit();
    
    console.log(`Pending product ${id} successfully deleted`);
    return res.status(200).json({ 
      success: true,
      message: 'Pending product deleted successfully' 
    });
  } catch (error) {
    console.error('Error in emergency pending product deletion:', error);
    
    try {
      await connection.rollback();
      await connection.query('SET FOREIGN_KEY_CHECKS=1');
    } catch (rollbackError) {
      console.error('Error during rollback:', rollbackError);
    }
    
    return res.status(500).json({ 
      success: false,
      message: 'Failed to delete pending product',
      error: error.message,
      detail: 'Check server logs for more information'
    });
  } finally {
    connection.release();
  }
});

// Add this new route near the other deletion routes

// Emergency direct database deletion endpoint
router.post('/products/emergency-delete', async (req, res) => {
  const { productId } = req.body;
  const connection = await pool.getConnection();
  
  try {
    console.log(`Emergency delete for product ID: ${productId}`);
    
    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS=0');
    
    // Try to directly delete from all possible tables
    const tables = [
      'Product',
      'ReviewDiscussesProduct',
      'SalesManagerManagesPriceProduct',
      'ProductManagerRestocksProduct',
      'CategoryCategorizesProduct',
      'Pictures',
      'CartContainsProduct',
      'WishlistItems',
      'OrderOrderItemsProduct',
      'Returns',
      'CustomerViewsProduct',
      'ProductAttributes'
    ];
    
    for (const table of tables) {
      try {
        const [result] = await connection.query(
          `DELETE FROM ${table} WHERE ${table === 'Product' ? 'productID' : 'productID'} = ?`, 
          [productId]
        );
        console.log(`Deleted from ${table}: ${result.affectedRows} rows`);
      } catch (tableError) {
        console.error(`Could not delete from ${table}:`, tableError.message);
      }
    }
    
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    await connection.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Product deleted with emergency method'
    });
  } catch (error) {
    await connection.rollback();
    await connection.query('SET FOREIGN_KEY_CHECKS=1');
    console.error('Emergency delete failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Emergency deletion failed',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

// Enhance the recently-approved endpoint to provide more data

router.get('/debug/recently-approved', async (req, res) => {
  try {
    // Get products approved in the last 24 hours
    const [products] = await pool.query(`
      SELECT 
        p.*,
        GROUP_CONCAT(DISTINCT pic.picturePath) as pictures
      FROM Product p
      LEFT JOIN Pictures pic ON p.productID = pic.productID
      WHERE p.showProduct = 1 
      AND p.unitPrice > 0
      AND p.timeListed >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY p.productID
    `);
    
    // Format the products with picture arrays
    const formattedProducts = products.map(product => ({
      ...product,
      pictures: product.pictures ? product.pictures.split(',') : []
    }));

    console.log(`Found ${formattedProducts.length} recently approved products`);
    
    return res.status(200).json({
      count: formattedProducts.length,
      products: formattedProducts
    });
  } catch (error) {
    console.error('Error in recently-approved route:', error);
    return res.status(500).json({ 
      message: 'Error fetching recently approved products', 
      error: error.message 
    });
  }
});

// Add this new debug endpoint to check product visibility

router.get('/debug/product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get basic product info
    const [productInfo] = await pool.query(
      'SELECT * FROM Product WHERE productID = ?', 
      [id]
    );
    
    if (productInfo.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Get category info
    const [categoryInfo] = await pool.query(
      `SELECT c.categoryID, c.name as categoryName
       FROM Category c
       JOIN CategoryCategorizesProduct ccp ON c.categoryID = ccp.categoryID
       WHERE ccp.productID = ?`,
      [id]
    );
    
    // Get image info
    const [imageInfo] = await pool.query(
      'SELECT * FROM Pictures WHERE productID = ?',
      [id]
    );
    
    return res.status(200).json({
      product: productInfo[0],
      category: categoryInfo.length > 0 ? categoryInfo[0] : null,
      images: imageInfo,
      visibility: {
        showProduct: productInfo[0].showProduct === 1 ? 'Visible' : 'Hidden',
        hasPrice: productInfo[0].unitPrice > 0 ? 'Yes' : 'No',
        hasCategory: categoryInfo.length > 0 ? 'Yes' : 'No',
        hasImages: imageInfo.length > 0 ? 'Yes' : 'No',
      }
    });
  } catch (error) {
    console.error('Error in debug product endpoint:', error);
    return res.status(500).json({ message: 'Error getting product debug info', error: error.message });
  }
});

// Add this debug endpoint near your other debug routes

router.get('/debug/product-category/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get all category assignments for this product
    const [categories] = await pool.query(`
      SELECT c.categoryID, c.name, c.parentCategoryID
      FROM CategoryCategorizesProduct ccp
      JOIN Category c ON ccp.categoryID = c.categoryID
      WHERE ccp.productID = ?
    `, [productId]);
    
    // Get product basic info
    const [product] = await pool.query('SELECT * FROM Product WHERE productID = ?', [productId]);
    
    return res.json({
      productId,
      productInfo: product[0] || null,
      categories,
      message: categories.length > 0 
        ? `Product is assigned to ${categories.length} categories` 
        : 'Product is not assigned to any category'
    });
  } catch (error) {
    console.error('Error in debug product-category endpoint:', error);
    return res.status(500).json({ message: 'Error getting product category info', error: error.message });
  }
});

// Add this debug endpoint to help verify category assignments

router.get('/debug/football-products', async (req, res) => {
  try {
    // Find Football category ID
    const [footballCategory] = await pool.query(
      'SELECT categoryID FROM Category WHERE name = ? OR name = ?',
      ['Football', 'football']
    );
    
    if (!footballCategory || footballCategory.length === 0) {
      return res.status(404).json({ message: 'Football category not found' });
    }
    
    const footballCategoryID = footballCategory[0].categoryID;
    
    // Get all products in Football category
    const [products] = await pool.query(`
      SELECT p.*, GROUP_CONCAT(pic.picturePath) as pictures
      FROM Product p
      JOIN CategoryCategorizesProduct ccp ON p.productID = ccp.productID
      LEFT JOIN Pictures pic ON p.productID = pic.productID
      WHERE ccp.categoryID = ?
      GROUP BY p.productID
    `, [footballCategoryID]);
    
    return res.status(200).json({
      categoryId: footballCategoryID,
      productsCount: products.length,
      products: products.map(p => ({
        ...p,
        pictures: p.pictures ? p.pictures.split(',') : []
      }))
    });
  } catch (error) {
    console.error('Error in football-products debug route:', error);
    return res.status(500).json({ message: 'Error fetching football products', error: error.message });
  }
});

// Add this near your other debugging routes
router.get('/debug/wishlist-notifications/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const connection = await pool.getConnection();
    
    try {
      // Get product details
      const [product] = await connection.query(
        'SELECT * FROM Product WHERE productID = ?', 
        [productId]
      );
      
      if (product.length === 0) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Get all wishlist items for this product
      const [wishlistItems] = await connection.query(
        'SELECT * FROM WishlistItems WHERE productID = ?',
        [productId]
      );
      
      // Get all wishlists
      const [wishlists] = await connection.query(
        'SELECT * FROM Wishlist WHERE wishlistID IN (?)',
        [wishlistItems.map(item => item.wishlistID).length ? 
          wishlistItems.map(item => item.wishlistID) : [0]]
      );
      
      // Get customers who should be notified
      const [customers] = await connection.query(`
        SELECT DISTINCT c.customerID, c.username, u.name, u.email
        FROM WishlistItems wi
        JOIN Wishlist w ON wi.wishlistID = w.wishlistID
        JOIN Customer c ON w.customerID = c.customerID
        JOIN USERS u ON c.username = u.username
        WHERE wi.productID = ?
      `, [productId]);
      
      return res.status(200).json({
        product: product[0],
        wishlistItems,
        wishlists,
        customers,
        summary: `Found ${customers.length} customers who should receive notifications for product ${productId}`
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in wishlist notification debug endpoint:', error);
    return res.status(500).json({ message: 'Error checking wishlist notifications', error: error.message });
  }
});

// Add this debugging route to help troubleshoot wishlist notifications

router.get('/debug/wishlist-check/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // First check if product exists
    const [product] = await pool.query(
      'SELECT name FROM Product WHERE productID = ?', 
      [productId]
    );
    
    if (product.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is in any wishlist
    const [wishlistItems] = await pool.query(
      'SELECT wi.wishlistID, w.customerID FROM WishlistItems wi JOIN Wishlist w ON wi.wishlistID = w.wishlistID WHERE wi.productID = ?',
      [productId]
    );
    
    // Get customer details for these wishlist items
    const customerDetails = [];
    for (const item of wishlistItems) {
      const [customer] = await pool.query(
        `SELECT c.customerID, u.name, u.email
         FROM Customer c
         JOIN USERS u ON c.username = u.username
         WHERE c.customerID = ?`,
        [item.customerID]
      );
      
      if (customer.length > 0) {
        customerDetails.push(customer[0]);
      }
    }
    
    return res.status(200).json({
      productId,
      productName: product[0].name,
      totalWishlists: wishlistItems.length,
      customers: customerDetails,
      message: wishlistItems.length > 0 
        ? `Product is in ${wishlistItems.length} wishlists` 
        : 'Product is not in any wishlist'
    });
  } catch (error) {
    console.error('Error checking wishlists:', error);
    return res.status(500).json({ error: 'Failed to check wishlists' });
  }
});

export default router;