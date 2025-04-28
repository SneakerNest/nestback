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
        r.reviewID,
        r.reviewContent,
        r.reviewStars,
        r.customerID,
        r.productID,
        r.approvalStatus,
        u.name as reviewerName,
        CASE 
          WHEN r.approvalStatus = 0 THEN 'Pending Approval'
          WHEN r.approvalStatus = 1 THEN r.reviewContent
          ELSE NULL 
        END as displayContent
      FROM Review r
      JOIN Customer c ON r.customerID = c.customerID
      JOIN USERS u ON c.username = u.username
      WHERE r.productID = ? 
      AND (r.reviewStars IS NOT NULL OR r.approvalStatus = 1)`;
    
    const [results] = await pool.query(sql, [req.params.id]);
    res.status(200).json(results);
  } catch (err) {
    console.error(err);
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

    // Check if customer has purchased the product
    const [deliveredOrders] = await pool.query(
      `SELECT o.orderID 
       FROM \`Order\` o 
       JOIN OrderOrderItemsProduct oi ON o.orderID = oi.orderID 
       WHERE o.customerID = ? 
       AND oi.productID = ? 
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
          'UPDATE Review SET reviewStars = ?, approvalStatus = ? WHERE reviewID = ?',
          [reviewStars, 1, current.reviewID]
        );
        await updateProductRating(productID);
      }

      return res.status(200).json({ 
        msg: 'Rating updated successfully',
        status: 'approved'
      });
    } else {
      // Create new review with rating
      await pool.query(
        'INSERT INTO Review (productID, customerID, reviewStars, approvalStatus) VALUES (?, ?, ?, ?)',
        [productID, customerID, reviewStars, 1]
      );

      // Update product's overall rating
      await updateProductRating(productID);

      return res.status(201).json({ 
        msg: 'Rating submitted successfully',
        status: 'approved'
      });
    }

  } catch (error) {
    console.error('Error creating review:', error);
    return res.status(500).json({ 
      msg: 'Error submitting rating',
      error: error.message 
    });
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
    console.log('Getting pending reviews...');
    
    const sql = `
      SELECT 
        r.reviewID,
        r.reviewContent,
        r.reviewStars,
        r.customerID,
        r.productID,
        r.approvalStatus,
        p.name as productName,
        u.name as reviewerName,
        u.username as reviewerUsername
      FROM Review r 
      JOIN Product p ON r.productID = p.productID 
      JOIN Customer c ON r.customerID = c.customerID
      JOIN USERS u ON c.username = u.username
      WHERE r.approvalStatus = 0 
      AND r.reviewContent IS NOT NULL  /* Only get reviews with text content */
      ORDER BY r.reviewID DESC`;
    
    const [results] = await pool.query(sql);
    
    console.log('Query results:', results);
    
    if (results.length === 0) {
      console.log('No pending reviews found');
      return res.status(200).json([]);
    }

    const formattedResults = results.map(review => ({
      reviewID: review.reviewID,
      productID: review.productID,
      productName: review.productName,
      reviewContent: review.reviewContent,
      reviewStars: review.reviewStars,
      reviewerName: review.reviewerName,
      reviewerUsername: review.reviewerUsername,
      customerID: review.customerID,
      approvalStatus: review.approvalStatus
    }));

    console.log('Formatted results:', formattedResults);
    res.status(200).json(formattedResults);
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
      'SELECT r.*, p.name as productName FROM Review r JOIN Product p ON r.productID = p.productID WHERE r.reviewID = ?',
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
      msg: "Review approved successfully",
      review: review[0]
    });

  } catch (err) {
    console.error("Error approving review:", err);
    res.status(500).json({ msg: "Error approving review" });
  }
};

const submitRating = async (req, res) => {
  try {
    const { productID, customerID, rating } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ msg: 'Rating must be between 1 and 5' });
    }

    // Always insert ratings as approved (approvalStatus = 1)
    await pool.query(
      `INSERT INTO Review (productID, customerID, reviewStars, approvalStatus) 
       VALUES (?, ?, ?, 1) 
       ON DUPLICATE KEY UPDATE 
       reviewStars = VALUES(reviewStars), 
       approvalStatus = CASE 
         WHEN reviewContent IS NULL THEN 1  /* If only rating, approve automatically */
         ELSE approvalStatus               /* Keep existing approval status if there's a review */
       END`,
      [productID, customerID, rating]
    );

    // Update product's overall rating immediately
    await updateProductRating(productID);

    res.status(200).json({ msg: 'Rating submitted and approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error submitting rating' });
  }
};

const submitReview = async (req, res) => {
  try {
    const { productID, customerID, reviewContent } = req.body;

    if (!reviewContent?.trim()) {
      return res.status(400).json({ msg: 'Review content is required' });
    }

    // Insert review with pending status
    await pool.query(
      'INSERT INTO Review (productID, customerID, reviewContent, approvalStatus) VALUES (?, ?, ?, 0) ' +
      'ON DUPLICATE KEY UPDATE reviewContent = VALUES(reviewContent), approvalStatus = 0',
      [productID, customerID, reviewContent.trim()]
    );

    res.status(200).json({ msg: 'Review submitted and pending approval' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error submitting review' });
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
  approveReviewComment,
  submitRating,
  submitReview
};