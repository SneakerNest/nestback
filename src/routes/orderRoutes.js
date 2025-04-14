import { Router } from 'express';
import { createOrder } from "../services/orderService.js";
import { verifyToken } from '../middleware/validateAuth.js';

const router = Router();

// Endpoint to create a new order
router.post('/', verifyToken, createOrder);

export default router;
