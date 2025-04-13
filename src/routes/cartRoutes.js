import { Router } from 'express';
import {
  getCart,
  addCartItem,
  removeCartItem,
} from '../controllers/cartController.js';
import { verifyToken } from '../middleware/validateAuth.js';
import { validateCartAddition } from '../middleware/validateProduct.js';

const router = Router();

router.get('/', verifyToken, getCart);
router.post('/', verifyToken, validateCartAddition, addCartItem);
router.delete('/item', verifyToken, removeCartItem);

export default router;
