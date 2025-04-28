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

// Product Manager Routes - Put these first to avoid route conflicts
router.get('/pending', authenticateToken, authenticateRole(['productManager']), getAllPendingReviews);
router.put('/:reviewId/approve', authenticateToken, authenticateRole(['productManager']), approveReviewComment);
router.delete('/:reviewId', authenticateToken, deleteReview);

// Customer Routes
router.post('/rating', authenticateToken, submitRating);
router.post('/review', authenticateToken, submitReview);
router.put('/:reviewId', authenticateToken, updateReview);

// Public Routes
router.get('/product/:id', getAllReviews);
router.get('/product/:id/approved', getApprovedReviews);
router.get('/:reviewId', getReviewById);

export default router;