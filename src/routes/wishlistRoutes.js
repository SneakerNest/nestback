import { Router } from 'express';
import { getWishlist, addWishlistItem, removeWishlistItem } from '../controllers/wishlistController.js';
import { verifyToken } from '../middleware/validateAuth.js'; // your auth middleware

const router = Router();

// Endpoint to get the wishlist for the logged-in user.
router.get('/', verifyToken, getWishlist);

// Endpoint to add an item to the wishlist.
router.post('/', verifyToken, addWishlistItem);

// Endpoint to remove an item from the wishlist.
router.delete('/', verifyToken, removeWishlistItem);

export default router;
