import { Router } from 'express';
import {
  submitRating,
  submitReview,
  getAllReviews,
  getApprovedReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getPendingReviews,
  getAllPendingReviews,
  approveReviewComment
} from '../controllers/reviewsController.js';

import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

const router = Router();

// Public Routes - No Authentication Required
router.get('/product/:id', getAllReviews);
router.get('/product/:id/approved', getApprovedReviews);
router.get('/:reviewId', getReviewById);

// Protected Routes - Customer Authentication Required
router.post('/rating', authenticateToken, submitRating);
router.post('/review', authenticateToken, submitReview);
router.put('/:reviewId', authenticateToken, updateReview);
router.delete('/:reviewId', authenticateToken, deleteReview);

// Product Manager Routes
router.get('/pending', 
  authenticateToken, 
  authenticateRole(['productManager']), 
  getAllPendingReviews
);

router.get('/pending/:productManagerUsername', 
  authenticateToken, 
  authenticateRole(['productManager']), 
  getPendingReviews
);

router.put('/:reviewId/approve', 
  authenticateToken, 
  authenticateRole(['productManager']), 
  approveReviewComment
);

export default router;