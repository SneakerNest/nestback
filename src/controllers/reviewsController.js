import { pool } from '../config/database.js';

const getAllReviews = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM `Review` where productID = ?', [req.params.id]);
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error retrieving reviews" });
  }
};

const getApprovedReviews = async (req, res) => {
  try {
    const sql = `
      SELECT 
        reviewID,
        CASE WHEN approvalStatus = 1 THEN reviewContent ELSE NULL END as reviewContent,
        reviewStars,
        customerID,
        productID,
        productManagerUsername,
        approvalStatus
      FROM Review 
      WHERE productID = ? 
      AND (reviewStars IS NOT NULL OR approvalStatus = 1)`;
    
    const [results] = await pool.query(sql, [req.params.id]);
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error retrieving reviews" });
  }
};

const getReviewById = async (req, res) => {
  try {
    const sql = 'SELECT * FROM `Review` WHERE reviewID = ?';
    const [results] = await pool.query(sql, [req.params.reviewId]);
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error retrieving review" });
  }
};

const getOverallRatingById = async (req, res) => {
  try {
    const sql = 'SELECT overallRating FROM `Product` WHERE productID = ?';
    const [results] = await pool.query(sql, [req.params.productID]);
    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error retrieving review" });
  }
};

const createReview = async (req, res) => {
  try {
    const { productID, reviewContent, reviewStars, customerID } = req.body;

    if (!customerID || !productID) {
      return res.status(400).json({ 
        msg: "Customer ID and Product ID are required" 
      });
    }

    // Check delivery status
    const [deliveredOrders] = await pool.query(
      `SELECT o.orderID 
       FROM \`Order\` o 
       JOIN OrderOrderItemsProduct oop ON o.orderID = oop.orderID 
       WHERE o.customerID = ? 
       AND oop.productID = ? 
       AND o.deliveryStatus = 'Delivered'`,
      [customerID, productID]
    );

    if (deliveredOrders.length === 0) {
      return res.status(400).json({ 
        msg: "You can only review products from delivered orders" 
      });
    }

    // Check existing review
    const [existingReview] = await pool.query(
      'SELECT reviewID, reviewContent, reviewStars FROM Review WHERE customerID = ? AND productID = ?',
      [customerID, productID]
    );

    if (existingReview.length > 0) {
      const current = existingReview[0];

      // Handle rating addition (always approved)
      if (reviewStars && !current.reviewStars) {
        await pool.query(
          'UPDATE Review SET reviewStars = ? WHERE reviewID = ?',
          [reviewStars, current.reviewID]
        );
        await updateProductRating(productID);
      }

      // Handle comment addition (needs approval)
      if (reviewContent && !current.reviewContent) {
        const [productManager] = await assignProductManager(productID);
        await pool.query(
          'UPDATE Review SET reviewContent = ?, productManagerUsername = ?, approvalStatus = 0 WHERE reviewID = ?',
          [reviewContent, productManager.username, current.reviewID]
        );
      }

      return res.status(200).json({ 
        msg: `Update successful. ${reviewStars ? 'Rating visible immediately. ' : ''}${reviewContent ? 'Comment pending approval.' : ''}`
      });

    } else {
      // Creating new review
      const [productManager] = reviewContent ? await assignProductManager(productID) : [{ username: null }];
      
      // Create the review
      const [result] = await pool.query(
        'INSERT INTO Review (reviewContent, reviewStars, customerID, productID, productManagerUsername, approvalStatus) VALUES (?, ?, ?, ?, ?, ?)',
        [
          reviewContent || null,
          reviewStars || null,
          customerID,
          productID,
          productManager.username,
          0 // Start with pending status
        ]
      );

      // If there's a rating, make it visible immediately
      if (reviewStars) {
        await updateProductRating(productID);
      }

      return res.status(201).json({ 
        msg: `Review created. ${reviewStars ? 'Rating visible immediately. ' : ''}${reviewContent ? 'Comment pending approval.' : ''}`
      });
    }

  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ msg: "Error creating review" });
  }
};

// Helper function to update product rating
const updateProductRating = async (productID) => {
  const [reviews] = await pool.query(
    'SELECT reviewStars FROM `Review` WHERE productID = ? AND reviewStars IS NOT NULL',
    [productID]
  );

  if (reviews.length > 0) {
    const totalStars = reviews.reduce((sum, review) => sum + review.reviewStars, 0);
    const averageRating = (totalStars / reviews.length).toFixed(2);
    
    await pool.query(
      'UPDATE `Product` SET overallRating = ? WHERE productID = ?',
      [averageRating, productID]
    );
  }
};

// Helper function to assign product manager
const assignProductManager = async (productID) => {
  const [productSupplier] = await pool.query(
    'SELECT supplierID FROM `Product` WHERE productID = ?',
    [productID]
  );

  if (!productSupplier.length) {
    throw new Error("Product supplier not found");
  }

  const [productManagers] = await pool.query(
    'SELECT username FROM `ProductManager` WHERE supplierID = ?',
    [productSupplier[0].supplierID]
  );

  if (!productManagers.length) {
    throw new Error("No product managers found for this supplier");
  }

  return [productManagers[Math.floor(Math.random() * productManagers.length)]];
};

const updateReview = async (req, res) => {
  try {
    const getReviewSql = 'SELECT * FROM `Review` WHERE reviewID = ?';
    const [existingReview] = await pool.query(getReviewSql, [req.params.reviewId]);

    if (existingReview.length === 0) {
      return res.status(404).json({ msg: "Review not found" });
    }

    const updatedReview = {
      reviewContent: req.body.reviewContent ?? existingReview[0].reviewContent,
      reviewStars: req.body.reviewStars ?? existingReview[0].reviewStars,
      customerID: req.body.customerID ?? existingReview[0].customerID,
      productID: req.body.productID ?? existingReview[0].productID,
      productManagerUsername: req.body.productManagerUsername ?? existingReview[0].productManagerUsername,
      approvalStatus: req.body.approvalStatus ?? existingReview[0].approvalStatus
    };

    const updateSql = 'UPDATE `Review` SET reviewContent = ?, reviewStars = ?, customerID = ?, productID = ?, productManagerUsername = ?, approvalStatus = ? WHERE reviewID = ?';
    await pool.query(updateSql, [
      updatedReview.reviewContent,
      updatedReview.reviewStars,
      updatedReview.customerID,
      updatedReview.productID,
      updatedReview.productManagerUsername,
      updatedReview.approvalStatus,
      req.params.reviewId
    ]);

    if (updatedReview.approvalStatus === 1) {
      const getApprovedReviewsSql = 'SELECT reviewStars FROM `Review` WHERE productID = ? AND approvalStatus = 1';
      const [approvedReviews] = await pool.query(getApprovedReviewsSql, [updatedReview.productID]);

      if (approvedReviews.length > 0) {
        const totalStars = approvedReviews.reduce((sum, review) => sum + review.reviewStars, 0);
        const averageRating = (totalStars / approvedReviews.length).toFixed(2);

        const updateProductSql = 'UPDATE `Product` SET overallRating = ? WHERE productID = ?';
        await pool.query(updateProductSql, [averageRating, updatedReview.productID]);
      }
    }

    res.status(200).json({ msg: "Review updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error updating review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const sql = 'DELETE FROM `Review` WHERE reviewID = ?';
    await pool.query(sql, [req.params.reviewId]);
    res.status(200).json({ msg: "Review deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error deleting review" });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const { productManagerUsername } = req.params;

    const sql = 'SELECT * FROM `Review` WHERE productManagerUsername = ? AND approvalStatus = 0';
    const [results] = await pool.query(sql, [productManagerUsername]);

    res.status(200).json(results);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error retrieving pending reviews" });
  }
};

const getAllPendingReviews = async (req, res) => {
  try {
    const sql = `
        SELECT 
            r.reviewID,
            r.reviewContent,
            r.reviewStars,
            r.customerID,
            r.productID,
            r.productManagerUsername,
            r.approvalStatus,
            p.name as productName 
        FROM Review r 
        JOIN Product p ON r.productID = p.productID 
        WHERE r.approvalStatus = 0`;
        
    const [results] = await pool.query(sql);
    
    if (results.length === 0) {
      return res.status(200).json({ msg: "No pending reviews found", reviews: [] });
    }
    
    res.status(200).json(results);
  } catch (err) {
    console.error("Error in getAllPendingReviews:", err);
    res.status(500).json({ msg: "Error retrieving pending reviews" });
  }
};

const approveReviewComment = async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    // Check if review exists and has content
    const [review] = await pool.query(
      'SELECT reviewID, reviewContent FROM Review WHERE reviewID = ?',
      [reviewId]
    );

    if (review.length === 0) {
      return res.status(404).json({ msg: "Review not found" });
    }

    if (!review[0].reviewContent) {
      return res.status(400).json({ msg: "This review has no comment to approve" });
    }

    // Update approval status
    await pool.query(
      'UPDATE Review SET approvalStatus = 1 WHERE reviewID = ?',
      [reviewId]
    );

    res.status(200).json({ 
      msg: "Review comment approved successfully",
      reviewId: reviewId
    });

  } catch (err) {
    console.error("Error approving review:", err);
    res.status(500).json({ msg: "Error approving review comment" });
  }
};

export {
  getAllReviews,
  getApprovedReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getPendingReviews,
  getOverallRatingById,
  getAllPendingReviews,
  approveReviewComment
};