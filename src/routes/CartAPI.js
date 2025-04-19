// src/routes/cartRoutes.js
import { Router } from 'express';
import { 
    getOrCreateCart, 
    addProductToCart, 
    removeProductFromCart,
    deleteProductFromCart,
    mergeCartsOnLogin,
    deletePermanentCartOnLogout 
} from '../controllers/cartController.js';
import { getCartProducts } from '../controllers/cartContainsProduct.js';

const router = Router();

// Sample sanity route
router.get('/', (req, res) => {
    res.send('Cart API, welcome!');
});

// Cart operations
router.post('/fetch', (req, res) => {
    return getOrCreateCart(req, res);
});

router.post('/product/add/:productID', (req, res) => {
    return addProductToCart(req, res);
});

router.post('/product/remove/:productID', (req, res) => {
    return removeProductFromCart(req, res);
});

router.post('/product/delete/:productID', (req, res) => {
    return deleteProductFromCart(req, res);
});

// Cart management for login/logout
router.post('/merge/:customerID', (req, res) => {
    return mergeCartsOnLogin(req, res);
});

router.put('/permanent/:customerID', (req, res) => {
    return deletePermanentCartOnLogout(req, res);
});

// Fetch products in cart
router.get('/products', (req, res) => {
    return getCartProducts(req, res);
});

export default router;