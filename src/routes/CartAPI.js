// src/routes/cartRoutes.js
import { Router } from 'express';
import { getOrCreateCart, addProductToCart, removeProductFromCart } from '../controllers/cartController.js'; // Import functions

const router = Router();

// Fetch or create a temporary cart using cookies
router.post('/', (req, res) => {
  return getOrCreateCart(req, res);
});

// Add product to cart (creation or insertion) using cookies
router.post('/product/add/:productID', (req, res) => {
  return addProductToCart(req, res);
});
 
// Remove product from cart (decrement or deletion) in cart using cookies
router.post('/product/remove/:productID', (req, res) => {
  return removeProductFromCart(req, res);
});

export default router;