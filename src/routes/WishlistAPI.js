import { Router } from 'express';
import {
  addProductToWishlist,
  viewWishlist,
  removeProductFromWishlist,
  moveToCart
} from '../controllers/wishlistController.js';
import { authenticateToken } from '../middleware/auth-handler.js';

const router = Router();

router.post('/product/add/:productID', authenticateToken, addProductToWishlist);
router.get('/', authenticateToken, viewWishlist);
router.delete('/product/remove/:productID', authenticateToken, removeProductFromWishlist);
router.post('/product/move-to-cart/:productID', authenticateToken, moveToCart);

export default router;