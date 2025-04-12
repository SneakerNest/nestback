import { pool } from '../config/database.js'; // MySQL database connection
import { randomUUID } from 'crypto';  //

// Fetch or create a temporary/permanent cart and get its products using cookies/customerID
const getOrCreateCart = async (req, res) => {
    try {
      let { fingerprint } = req.cookies;
      const customerID = req.body.customerID || null; // Get customerID if the user is logged in, otherwise null
  
      let cartID;
      let rows;
  
      // If user is logged in, create or fetch permanent cart
      if (customerID) {
        [rows] = await pool.query(
          'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
          [customerID]
        );
  
        if (rows.length === 0) {
          // Create a new permanent cart if none exists
          const [result] = await pool.query(
            'INSERT INTO Cart (totalPrice, numProducts, customerID, temporary) VALUES (?, ?, ?, ?)',
            [0, 0, customerID, false]
          );
          cartID = result.insertId;
          [rows] = await pool.query(
            'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
            [customerID]
          );
          console.log('New permanent cart created with ID:', cartID);
        } else {
          cartID = rows[0].cartID;
        }
      } else {
        // If user is not logged in, handle temporary cart
        if (!fingerprint) {
          fingerprint = randomUUID();
          res.cookie('fingerprint', fingerprint, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
          console.log('New fingerprint created:', fingerprint);
  
          const [result] = await pool.query(
            'INSERT INTO Cart (totalPrice, numProducts, fingerprint, temporary) VALUES (?, ?, ?, ?)',
            [0, 0, fingerprint, true]
          );
          cartID = result.insertId;
          console.log('New temporary cart created with ID:', cartID);
        } else {
          [rows] = await pool.query(
            'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true AND timeCreated > NOW() - INTERVAL 7 DAY',
            [fingerprint]
          );
  
          if (rows.length === 0) {
            const [result] = await pool.query(
              'INSERT INTO Cart (totalPrice, numProducts, fingerprint, temporary) VALUES (?, ?, ?, ?)',
              [0, 0, fingerprint, true]
            );
            cartID = result.insertId;
            console.log('New temporary cart created with ID:', cartID);
          } else {
            cartID = rows[0].cartID;
          }
        }
      }
  
      // Fetch products in the cart and calculate the discounted price
      const [cartProducts] = await pool.query(
        'SELECT p.productID, p.name, p.unitPrice, p.discountPercentage, ccp.quantity FROM CartContainsProduct ccp JOIN Product p ON ccp.productID = p.productID WHERE ccp.cartID = ?',
        [cartID]
      );
  
      // Add discounted price to each product in the cart
      const productsWithDiscount = cartProducts.map(product => {
        const discountedPrice = product.unitPrice * (1 - (product.discountPercentage / 100));
        return {
          ...product,
          discountedPrice: discountedPrice.toFixed(2) // Ensuring it's in two decimal places
        };
      });
  
      return res.status(200).json({
        cartID,
        loggedIn: !!customerID,
        temporary: !!rows[0].temporary,
        fingerprint,
        customerID,
        totalPrice: rows[0].totalPrice,
        numProducts: rows[0].numProducts,
        timeCreated: rows[0].timeCreated,
        products: productsWithDiscount
      });
  
    } catch (err) {
      console.error('Error fetching or creating cart:', err);
      res.status(500).json({ error: 'Failed to fetch or create cart.' });
    }
  };

// Add product to cart (create or update cart)
const addProductToCart = async (req, res) => {
    try {
      const { productID } = req.params;
      let { fingerprint } = req.cookies;
      const customerID = req.body.customerID || null;
  
      // If productID is not provided, return an error
      if (!productID) {
        return res.status(400).json({ error: 'Product ID is required.' });
      }
      let cartID;
  
      if (customerID) {
        const [permCartRows] = await pool.query(
          'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
          [customerID]
        );
  
        if (permCartRows.length === 0) {
          const [result] = await pool.query(
            'INSERT INTO Cart (totalPrice, numProducts, customerID, temporary) VALUES (?, ?, ?, ?)',
            [0, 0, customerID, false]
          );
          cartID = result.insertId;
        } else {
          cartID = permCartRows[0].cartID;
        }
      } else {
        if (!fingerprint) {
          fingerprint = randomUUID();
          res.cookie('fingerprint', fingerprint, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
          const [result] = await pool.query(
            'INSERT INTO Cart (totalPrice, numProducts, fingerprint, temporary) VALUES (?, ?, ?, ?)',
            [0, 0, fingerprint, true]
          );
          cartID = result.insertId;
        } else {
          const [rows] = await pool.query(
            'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true AND timeCreated > NOW() - INTERVAL 7 DAY',
            [fingerprint]
          );
  
          if (rows.length === 0) {
            const [result] = await pool.query(
              'INSERT INTO Cart (totalPrice, numProducts, fingerprint, temporary) VALUES (?, ?, ?, ?)',
              [0, 0, fingerprint, true]
            );
            cartID = result.insertId;
          } else {
            cartID = rows[0].cartID;
          }
        }
      }
  
      // Fetch the product details, including the discount percentage and unit price
      const [productDetails] = await pool.query(
        'SELECT unitPrice, discountPercentage FROM Product WHERE productID = ?',
        [productID]
      );
  
      if (productDetails.length === 0) {
        return res.status(404).json({ error: 'Product not found.' });
      }
  
      const { unitPrice, discountPercentage } = productDetails[0];
      // Calculate the discounted price
      const discountedPrice = unitPrice * (1 - discountPercentage / 100);
  
      // Add product to the cart or update quantity
      await pool.query(
        'INSERT INTO CartContainsProduct (cartID, productID, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
        [cartID, productID]
      );
  
      // Update cart totals
      await pool.query(
        'UPDATE Cart SET numProducts = numProducts + 1, totalPrice = totalPrice + ? WHERE cartID = ?',
        [discountedPrice, cartID]
      );
  
      return res.status(201).json({
        message: 'Product added to cart successfully.',
        cartID,
        loggedIn: !!customerID,
        fingerprint,
        customerID
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add product to cart.' });
    }
  };
  

// Remove product from cart (decrement or remove entirely)
const removeProductFromCart = async (req, res) => {
  const { productID } = req.params; // Get product ID from the request parameter
  let { fingerprint } = req.cookies;
  const customerID = req.body.customerID || null; // Get customerID if the user is logged in, otherwise null

  try {
    let cartID;

    if (customerID) {
      // User is logged in, use permanent cart
      const [permCartRows] = await pool.query(
        'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
        [customerID]
      );

      if (permCartRows.length === 0) {
        return res.status(404).json({ error: 'No permanent cart found for the user.' });
      }

      cartID = permCartRows[0].cartID;
    } else {
      // User is not logged in, use temporary cart
      const [rows] = await pool.query(
        'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true AND timeCreated > NOW() - INTERVAL 7 DAY',
        [fingerprint]
      );

      if (!rows.length) {
        return res.status(404).json({ error: 'No temporary cart found for the user.' });
      }

      cartID = rows[0].cartID;
    }

    // Check if the product exists in the cart
    const [productRows] = await pool.query(
      'SELECT quantity FROM CartContainsProduct WHERE cartID = ? AND productID = ?',
      [cartID, productID]
    );

    if (!productRows.length) {
      return res.status(404).json({ error: 'Product not found in the cart.' });
    }

    const currentQuantity = productRows[0].quantity;

    if (currentQuantity === 1) {
      // Remove the product from the cart entirely if the quantity is 1
      await pool.query(
        'DELETE FROM CartContainsProduct WHERE cartID = ? AND productID = ?',
        [cartID, productID]
      );
    } else {
      // Decrement the quantity by 1
      await pool.query(
        'UPDATE CartContainsProduct SET quantity = quantity - 1 WHERE cartID = ? AND productID = ?',
        [cartID, productID]
      );
    }

    // Update cart totals
    await pool.query(
      'UPDATE Cart SET numProducts = numProducts - 1, totalPrice = totalPrice - (SELECT unitPrice * (1 - discountPercentage/100) FROM Product WHERE productID = ?) WHERE cartID = ?',
      [productID, cartID]
    );

    res.status(200).json({
      message: 'Product removed from cart successfully.',
      cartID,
      loggedIn: !!customerID,
      fingerprint,
      customerID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove product from cart.' });
  }
};

export { getOrCreateCart, addProductToCart, removeProductFromCart };