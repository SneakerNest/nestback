import { Router } from 'express';

import {getOrder,getUserOrders,getOrdersByDateRange,cancelOrder,getPurchasePrice,getAllOrder} from '../controllers/orderController.js';

const router = Router();


router.get('/', getAllOrder);
router.get('/:id', getOrder);
router.get('/user/me/orders', getUserOrders);
router.post('/daterange', getOrdersByDateRange);
router.put('/cancel/:id', cancelOrder);
router.get('/:orderid/product/:productid/purchase-price', getPurchasePrice);



export default router;