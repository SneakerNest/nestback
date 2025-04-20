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
    const sql = 'SELECT * FROM `Review` WHERE productID = ? AND approvalStatus = 1';
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

    if (!reviewStars) {
      return res.status(400).json({ msg: "Please fill in review stars" });
    }
    if (!customerID) {
      return res.status(400).json({ msg: "Please fill in customer ID" });
    }
    if (!productID) {
      return res.status(400).json({ msg: "Please fill in product ID" });
    }

    try {
      const getOrdersSQL = 'SELECT orderID FROM `Order` WHERE customerID = ?';
      const [customerOrders] = await pool.query(getOrdersSQL, [customerID]);

      if (customerOrders.length === 0) {
        return res.status(400).json({ msg: "You can't review a product you haven't bought" });
      }

      const orderIDs = customerOrders.map(order => order.orderID);

      const checkProductSQL = 'SELECT DISTINCT productID FROM `OrderOrderItemsProduct` WHERE orderID IN (?)';
      const [orderProducts] = await pool.query(checkProductSQL, [orderIDs]);

      const hasPurchased = orderProducts.some(item => item.productID == productID);

      if (!hasPurchased) {
        return res.status(400).json({ msg: "You can't review a product you haven't bought" });
      }
    } catch (error) {
      console.error("Error checking purchase history:", error);
      throw error;
    }

    if (!reviewContent) {
      const nullReviewContent = '(No written review)';
      const sql = 'INSERT INTO `Review` (reviewContent, reviewStars, customerID, productID, productManagerUsername, approvalStatus) VALUES (?, ?, ?, ?, ?, ?)';
      await pool.query(sql, [nullReviewContent, reviewStars, customerID, productID, null, 1]);

      const getReviewsSql = 'SELECT reviewStars FROM `Review` WHERE productID = ?';
      const [Reviews] = await pool.query(getReviewsSql, [productID]);

      if (Reviews.length > 0) {
        const totalStars = Reviews.reduce((sum, review) => sum + review.reviewStars, 0);
        const averageRating = (totalStars / Reviews.length).toFixed(2);

        const updateProductSql = 'UPDATE `Product` SET overallRating = ? WHERE productID = ?';
        await pool.query(updateProductSql, [averageRating, productID]);
      }
      return res.status(200).json({ msg: "Review created and auto-approved" });
    }

    const productSupplierSql = 'SELECT supplierID FROM `Product` WHERE productID = ?';
    const [productSupplierResults] = await pool.query(productSupplierSql, [productID]);

    if (productSupplierResults.length === 0) {
      return res.status(404).json({ msg: "Product Supplier not found for this product" });
    }

    const productSupplierID = productSupplierResults[0].supplierID;

    const productManagerSql = 'SELECT username FROM `ProductManager` WHERE supplierID = ?';
    const [productManagerResults] = await pool.query(productManagerSql, [productSupplierID]);

    if (productManagerResults.length === 0) {
      return res.status(404).json({ msg: "Product Manager not found for this supplier" });
    }

    const randomIndex = Math.floor(Math.random() * productManagerResults.length);
    const productManagerUsername = productManagerResults[randomIndex].username;

    const starReviewSql = 'INSERT INTO `Review` (reviewContent, reviewStars, customerID, productID, productManagerUsername, approvalStatus) VALUES (?, ?, ?, ?, ?, ?)';
    await pool.query(starReviewSql, [reviewContent, reviewStars, customerID, productID, productManagerUsername, 0]);

    const getReviewsSql = 'SELECT reviewStars FROM `Review` WHERE productID = ?';
    const [Reviews] = await pool.query(getReviewsSql, [productID]);

    const totalStars = Reviews.reduce((sum, review) => sum + review.reviewStars, 0);
    const averageRating = (totalStars / Reviews.length).toFixed(2);

    const updateProductSql = 'UPDATE `Product` SET overallRating = ? WHERE productID = ?';
    await pool.query(updateProductSql, [averageRating, productID]);

    res.status(200).json({ msg: "Review created" });
  } catch (err) {
    console.log("Error creating review:", err);
    res.status(500).json({ msg: "Error creating review" });
  }
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

export {
  getAllReviews,
  getApprovedReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getPendingReviews,
  getOverallRatingById
};