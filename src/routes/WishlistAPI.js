import { Router } from 'express';
import { addProductToWishlist, viewWishlist, removeProductFromWishlist, moveToCart } from '../controllers/wishlistController.js';

const router = Router();

// Route to add product to wishlist
router.post('/product/add/:productID', addProductToWishlist);

// Route to view wishlist
router.get('/', viewWishlist);

// Route to remove product from wishlist
router.delete('/product/remove/:productID', removeProductFromWishlist);

// Route to move product from wishlist to cart
router.post('/product/move-to-cart/:productID', moveToCart);

export default router;