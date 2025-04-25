import { pool } from '../config/database.js';  // MySQL database connection

// Add product to wishlist (only for logged-in users)
const addProductToWishlist = async (req, res) => {
  try {
    const { productID } = req.params;
    const customerID = req.body.customerID; // This should be passed by the client when logged in

    if (!customerID) {
      return res.status(400).json({ error: 'You must be logged in to add products to your wishlist.' });
    }

    if (!productID) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    // Check if the product is already in the cart
    const [cartProduct] = await pool.query(
      'SELECT * FROM CartContainsProduct WHERE cartID IN (SELECT cartID FROM Cart WHERE customerID = ?) AND productID = ?',
      [customerID, productID]
    );

    if (cartProduct.length > 0) {
      return res.status(400).json({ error: 'Product is already in your cart, cannot add to wishlist.' });
    }

    // Check if the user already has a wishlist
    const [wishlistRows] = await pool.query(
      'SELECT * FROM Wishlist WHERE customerID = ?',
      [customerID]
    );

    let wishlistID;
    if (wishlistRows.length === 0) {
      // Create a new wishlist for the user
      const [result] = await pool.query(
        'INSERT INTO Wishlist (customerID) VALUES (?)',
        [customerID]
      );
      wishlistID = result.insertId;
    } else {
      wishlistID = wishlistRows[0].wishlistID;
    }

    // Check if the product is already in the wishlist
    const [existingProduct] = await pool.query(
      'SELECT * FROM WishlistItems WHERE wishlistID = ? AND productID = ?',
      [wishlistID, productID]
    );

    if (existingProduct.length > 0) {
      return res.status(400).json({ error: 'Product is already in your wishlist.' });
    }

    // Add product to the wishlist
    await pool.query(
      'INSERT INTO WishlistItems (wishlistID, productID) VALUES (?, ?)',
      [wishlistID, productID]
    );

    res.status(201).json({ message: 'Product added to wishlist successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product to wishlist.' });
  }
};

// View wishlist (only for logged-in users)
const viewWishlist = async (req, res) => {
  try {
    const customerID = req.body.customerID; // This should be passed by the client when logged in

    if (!customerID) {
      return res.status(400).json({ error: 'Customer ID is required.' });
    }

    // Fetch the wishlist for the logged-in user
    const [wishlistRows] = await pool.query(
      'SELECT * FROM Wishlist WHERE customerID = ?',
      [customerID]
    );

    if (wishlistRows.length === 0) {
      return res.status(404).json({ error: 'Wishlist not found.' });
    }

    const wishlistID = wishlistRows[0].wishlistID;

    // Fetch products in the wishlist with discounted prices
    const [wishlistProducts] = await pool.query(
      'SELECT p.productID, p.name, p.unitPrice, p.discountPercentage, ' +
      'ROUND(p.unitPrice * (1 - p.discountPercentage / 100), 2) AS discountedPrice, wi.addedTime ' +
      'FROM WishlistItems wi ' +
      'JOIN Product p ON wi.productID = p.productID ' +
      'WHERE wi.wishlistID = ?',
      [wishlistID]
    );

    res.status(200).json({
      wishlistID,
      products: wishlistProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch wishlist.' });
  }
};

// Remove product from wishlist (only for logged-in users)
const removeProductFromWishlist = async (req, res) => {
  try {
    const { productID } = req.params;
    const customerID = req.body.customerID; // This should be passed by the client when logged in

    if (!customerID) {
      return res.status(400).json({ error: 'Customer ID is required.' });
    }

    if (!productID) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }

    // Check if the user has a wishlist
    const [wishlistRows] = await pool.query(
      'SELECT * FROM Wishlist WHERE customerID = ?',
      [customerID]
    );

    if (wishlistRows.length === 0) {
      return res.status(404).json({ error: 'Wishlist not found.' });
    }

    const wishlistID = wishlistRows[0].wishlistID;

    // Check if the product is in the wishlist
    const [existingProduct] = await pool.query(
      'SELECT * FROM WishlistItems WHERE wishlistID = ? AND productID = ?',
      [wishlistID, productID]
    );

    if (existingProduct.length === 0) {
      return res.status(404).json({ error: 'Product not found in wishlist.' });
    }

    // Remove product from wishlist
    await pool.query(
      'DELETE FROM WishlistItems WHERE wishlistID = ? AND productID = ?',
      [wishlistID, productID]
    );

    res.status(200).json({ message: 'Product removed from wishlist successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove product from wishlist.' });
  }
};

const moveToCart = async (req, res) => {
    try {
      const { productID } = req.params;
      const customerID = req.body.customerID;
  
      if (!customerID) {
        return res.status(400).json({ error: 'Customer ID is required.' });
      }
  
      if (!productID) {
        return res.status(400).json({ error: 'Product ID is required.' });
      }

      // Check product stock and get product details
      const [productDetails] = await pool.query(
        'SELECT stock, unitPrice, discountPercentage FROM Product WHERE productID = ?',
        [productID]
      );

      if (!productDetails.length || productDetails[0].stock === 0) {
        return res.status(400).json({ 
          error: 'Unable to move product to cart. Product is out of stock.'
        });
      }
  
      // 1. Check if the user has a wishlist
      const [wishlistRows] = await pool.query(
        'SELECT * FROM Wishlist WHERE customerID = ?',
        [customerID]
      );
  
      if (wishlistRows.length === 0) {
        return res.status(404).json({ error: 'Wishlist not found.' });
      }
  
      const wishlistID = wishlistRows[0].wishlistID;
  
      // 2. Check if the product is in the wishlist
      const [productRows] = await pool.query(
        'SELECT * FROM WishlistItems WHERE wishlistID = ? AND productID = ?',
        [wishlistID, productID]
      );
  
      if (productRows.length === 0) {
        return res.status(404).json({ error: 'Product not found in wishlist.' });
      }
  
      // 3. Check if the user already has a cart
      const [cartRows] = await pool.query(
        'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
        [customerID]
      );
  
      let cartID;
      if (cartRows.length === 0) {
        // If not, create a new permanent cart
        const [newCart] = await pool.query(
          'INSERT INTO Cart (totalPrice, numProducts, customerID, temporary) VALUES (?, ?, ?, ?)',
          [0, 0, customerID, false]
        );
        cartID = newCart.insertId;
      } else {
        cartID = cartRows[0].cartID;
      }
  
      // 4. Insert the product into CartContainsProduct
      await pool.query(
        'INSERT INTO CartContainsProduct (cartID, productID, quantity) VALUES (?, ?, 1)',
        [cartID, productID]
      );

      // 5. Update cart totals
      const discountedPrice = productDetails[0].unitPrice * (1 - productDetails[0].discountPercentage / 100);
      await pool.query(
        'UPDATE Cart SET numProducts = numProducts + 1, totalPrice = totalPrice + ? WHERE cartID = ?',
        [discountedPrice, cartID]
      );
  
      // 6. Remove product from wishlist
      await pool.query(
        'DELETE FROM WishlistItems WHERE wishlistID = ? AND productID = ?',
        [wishlistID, productID]
      );
  
      res.status(200).json({ 
        message: 'Product moved to cart successfully.',
        cartID: cartID
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to move product to cart.' });
    }
};

export { addProductToWishlist, viewWishlist, removeProductFromWishlist, moveToCart };