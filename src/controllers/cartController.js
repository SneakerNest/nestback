import { pool } from '../config/database.js';
import { randomUUID } from 'crypto';

// Fetch or create a temporary/permanent cart and get its products using cookies/customerID
const getOrCreateCart = async (req, res) => {
  try {
    // Add debugging
    console.log('1. Starting getOrCreateCart');
    console.log('2. Cookies:', req.cookies);
    
    // Retrieve fingerprint from cookies
    let { fingerprint } = req.cookies;
    console.log('3. Fingerprint:', fingerprint);

    const customerID = req.body.customerID || null;
    console.log('4. CustomerID:', customerID);

    let cartID;
    let rows;

    if (customerID) {
      // User is logged in, use permanent cart
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
      // User is not logged in, use temporary cart
      if (!fingerprint) {
        // Generate a new fingerprint (e.g., UUID)
        fingerprint = randomUUID();

        // Set the new fingerprint as a cookie
        res.cookie('fingerprint', fingerprint, {
          httpOnly: true, // Prevent client-side access to the cookie
          secure: false, // Secure cookie (HTTPS only)
          maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration (1 week)
        });
        console.log('New fingerprint created:', fingerprint);

        // Create a new temporary cart with the generated fingerprint
        const [result] = await pool.query(
          'INSERT INTO Cart (totalPrice, numProducts, fingerprint, temporary) VALUES (?, ?, ?, ?)',
          [0, 0, fingerprint, true]
        );
        cartID = result.insertId;
        [rows] = await pool.query(
          'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true',
          [fingerprint]
        );
        console.log('New temporary cart created with ID:', cartID);
      } else {
        // Check if a cart exists for the current fingerprint, and ensure it is not older than 7 days
        [rows] = await pool.query(
          'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true AND timeCreated > NOW() - INTERVAL 7 DAY',
          [fingerprint]
        );

        if (rows.length === 0) {
          // Create a new temporary cart if none exists
          const [result] = await pool.query(
            'INSERT INTO Cart (totalPrice, numProducts, fingerprint, temporary) VALUES (?, ?, ?, ?)',
            [0, 0, fingerprint, true]
          );
          cartID = result.insertId;
          [rows] = await pool.query(
            'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true AND timeCreated > NOW() - INTERVAL 7 DAY',
            [fingerprint]
          );
          console.log('New temporary cart created with ID:', cartID);
        } else {
          cartID = rows[0].cartID;
        }
      }
    }

    // Fetch products in the cart
    const [cartProducts] = await pool.query(
      'SELECT p.productID, p.name, p.unitPrice, p.discountPercentage, ccp.quantity FROM CartContainsProduct ccp JOIN Product p ON ccp.productID = p.productID WHERE ccp.cartID = ?',
      [cartID]
    );

    // Send response with cart details
    return res.status(200).json({
      cartID: cartID,
      loggedIn: !!customerID, // Return whether the user is logged in
      temporary: !!rows[0].temporary, // Return whether the cart is temporary
      fingerprint: fingerprint, // Return the fingerprint
      customerID: customerID, // Return the customerID
      totalPrice: rows[0].totalPrice,
      numProducts: rows[0].numProducts,
      timeCreated: rows[0].timeCreated,
      products: cartProducts // Return the products in the cart
    });

  } catch (err) {
    console.error('Cart Error:', err);
    res.status(500).json({ error: 'Failed to fetch or create cart.' });
  }
};

const addProductToCart = async (req, res) => {
  try {
    const { productID } = req.params; // Get product ID from the request parameter
    let { fingerprint } = req.cookies;

    const customerID = req.body.customerID || null; // Get customerID if the user is logged in, otherwise null

    let cartID;

    if (customerID) {
      // User is logged in, use permanent cart
      const [permCartRows] = await pool.query(
        'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
        [customerID]
      );

      if (permCartRows.length === 0) {
        // Create a new permanent cart if none exists
        const [result] = await pool.query(
          'INSERT INTO Cart (totalPrice, numProducts, customerID, temporary) VALUES (?, ?, ?, ?)',
          [0, 0, customerID, false]
        );
        cartID = result.insertId;
        console.log('New permanent cart created with ID:', cartID);
      } else {
        cartID = permCartRows[0].cartID;
      }
    } else {
      // User is not logged in, use temporary cart
      if (!fingerprint) {
        // Generate a new fingerprint (e.g., UUID)
        fingerprint = randomUUID();

        // Set the new fingerprint as a cookie
        res.cookie('fingerprint', fingerprint, {
          httpOnly: true, // Prevent client-side access to the cookie
          secure: false, // Secure cookie (HTTPS only)
          maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration (1 week)
        });
        console.log('New fingerprint created:', fingerprint);

        // Create a new temporary cart with the generated fingerprint
        const [result] = await pool.query(
          'INSERT INTO Cart (totalPrice, numProducts, fingerprint, temporary) VALUES (?, ?, ?, ?)',
          [0, 0, fingerprint, true]
        );
        cartID = result.insertId;
        console.log('New temporary cart created with ID:', cartID);
      } else {
        // Check if a cart exists for the current fingerprint, and ensure it is not older than 7 days
        const [rows] = await pool.query(
          'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true AND timeCreated > NOW() - INTERVAL 7 DAY',
          [fingerprint]
        );

        if (rows.length === 0) {
          // Create a new temporary cart if none exists
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

    // Add product to the cart
    await pool.query(
      'INSERT INTO CartContainsProduct (cartID, productID, quantity) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
      [cartID, productID]
    );

    // Update cart totals: numProducts and totalPrice
    await pool.query(
      'UPDATE Cart SET numProducts = numProducts + 1, totalPrice = totalPrice + (SELECT unitPrice * (1 - discountPercentage/100) FROM Product WHERE productID = ?) WHERE cartID = ?',
      [productID, cartID]
    );

    // Send response with success message and cart details
    return res.status(201).json({
      message: 'Product added to cart successfully.',
      cartID: cartID, // Return the cart ID
      loggedIn: !!customerID, // Return whether the user is logged in
      fingerprint: fingerprint, // Return the fingerprint
      customerID: customerID // Return the customerID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product to cart.' });
  }
};

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
      cartID: cartID, // Return the cart ID
      loggedIn: !!customerID, // Return whether the user is logged in
      fingerprint: fingerprint, // Return the fingerprint
      customerID: customerID // Return the customerID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove product from cart.' });
  }
};

const deleteProductFromCart = async (req, res) => {
  const { fingerprint } = req.cookies; // Retrieve fingerprint from cookies
  const { productID } = req.params; // Get product ID from the request parameter
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
        return res.status(404).json({ error: 'No active cart found for the user.' });
      }

      cartID = permCartRows[0].cartID;
    } else {
      // User is not logged in, use temporary cart
      const [rows] = await pool.query(
        'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true AND timeCreated > NOW() - INTERVAL 7 DAY',
        [fingerprint]
      );

      if (!rows.length) {
        return res.status(404).json({ error: 'No active cart found for the user.' });
      }

      cartID = rows[0].cartID;
    }

    // Check if the product exists in the cart
    const [productRows] = await pool.query(
      'SELECT quantity, (quantity * (SELECT unitPrice * (1 - discountPercentage/100) FROM Product WHERE productID = ?)) AS productTotal FROM CartContainsProduct WHERE cartID = ? AND productID = ?',
      [productID, cartID, productID]
    );

    if (!productRows.length) {
      return res.status(404).json({ error: 'Product not found in the cart.' });
    }

    const productTotal = productRows[0].productTotal;

    // Remove the product from the cart
    await pool.query(
      'DELETE FROM CartContainsProduct WHERE cartID = ? AND productID = ?',
      [cartID, productID]
    );

    // Update cart totals
    await pool.query(
      'UPDATE Cart SET numProducts = numProducts - ?, totalPrice = totalPrice - ? WHERE cartID = ?',
      [productRows[0].quantity, productTotal, cartID]
    );

    res.status(200).json({
      message: 'Product deleted from cart successfully.',
      cartID: cartID,
      loggedIn: !!customerID,
      fingerprint: fingerprint,
      customerID: customerID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product from cart.' });
  }
};

//Merge carts on login using cookies and customerID
///creates a new permanent cart if none exists, deletes the temporary cart if it exists, and clears the fingerprint cookie
const mergeCartsOnLogin = async (req, res) => {
  try {
    const customerID = req.params.customerID || null; // Get customerID if the user is logged in, otherwise null
    const { fingerprint } = req.cookies;

    if (!fingerprint) {
      return res.status(200).json({ msg: 'No temporary cart found' });
    }

    // Get the temporary cart
    const [tempCartRows] = await pool.query(
      'SELECT * FROM Cart WHERE fingerprint = ? AND temporary = true',
      [fingerprint]
    );

    if (tempCartRows.length === 0) {
      return res.status(400).json({ msg: 'No temporary cart found' });
    }

    const tempCartID = tempCartRows[0].cartID;

    // Get the permanent cart for the customer
    const [permCartRows] = await pool.query(
      'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
      [customerID]
    );

    let permCartID;
    if (permCartRows.length === 0) {
      // Create a new permanent cart if none exists
      console.log('customerID:', customerID);
      const [result] = await pool.query(
        'INSERT INTO Cart (totalPrice, numProducts, customerID, temporary) VALUES (?, ?, ?, ?)',
        [0, 0, customerID, false]
      );
      permCartID = result.insertId;
      console.log('New permanent cart created with ID:', permCartID);
    } else {
      permCartID = permCartRows[0].cartID;
    }

    // Merge products from temporary cart to permanent cart
    const [tempCartProducts] = await pool.query(
      'SELECT * FROM CartContainsProduct WHERE cartID = ?',
      [tempCartID]
    );

    const [tempCart] = await pool.query(
      'SELECT * FROM Cart WHERE cartID = ?',
      [tempCartID]
    );

    // Update user cart totals
    await pool.query(
      'UPDATE Cart SET totalPrice = totalPrice + ?, numProducts = numProducts + ? WHERE cartID = ?',
      [tempCart[0].totalPrice, tempCart[0].numProducts, permCartID]
    );

    for (const product of tempCartProducts) {
      await pool.query(
        'INSERT INTO CartContainsProduct (cartID, productID, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [permCartID, product.productID, product.quantity]
      );
    }

    // Delete the temporary cart
    await pool.query('DELETE FROM Cart WHERE cartID = ?', [tempCartID]);

    // Clear the fingerprint cookie
    res.clearCookie('fingerprint');

    res.status(200).json({ msg: 'Carts merged successfully' });
  } catch (err) {
    console.error('Error merging carts on login:', err);
    res.status(500).json({ error: 'Failed to merge carts.' });
  }
};

const deletePermanentCartOnLogout = async (req, res) => {
  const { customerID } = req.params || {};

  try {
    if (!customerID) {
      return res.status(400).json({ msg: 'User not logged in' });
    }

    // Fetch the permanent cart for the customer
    const [permCartRows] = await pool.query(
      'SELECT * FROM Cart WHERE customerID = ? AND temporary = false',
      [customerID]
    );

    if (permCartRows.length === 0) {
      return res.status(404).json({ msg: 'No permanent cart found for the user' });
    }

    const permCartID = permCartRows[0].cartID;

    // Check if the cart is empty
    const [cartProducts] = await pool.query(
      'SELECT * FROM CartContainsProduct WHERE cartID = ?',
      [permCartID]
    );

    if (cartProducts.length > 0) {
      return res.status(400).json({ msg: 'Cart is not empty' });
    }

    // Delete the permanent cart if it is empty
    await pool.query('DELETE FROM Cart WHERE cartID = ?', [permCartID]);

    res.status(200).json({ msg: 'Empty permanent cart deleted successfully' });
  } catch (err) {
    console.error('Error deleting permanent cart on logout:', err);
    res.status(500).json({ error: 'Failed to delete permanent cart' });
  }
};

//encapsulated function for internal use (namely for PDFAPI)
async function getCartData(req) {
  let cartData;

  // Create a mock response object with the necessary methods
  const mockRes = {
    status(code) {
      // Allow chaining by returning the same mock object
      this.statusCode = code;
      return this;
    },
    json(data) {
      cartData = data; // Capture the JSON response data
    },
    send(data) {
      cartData = data; // Capture data if `send` is used
    }
  };

  // Call getOrCreateCart with the mock response
  await getOrCreateCart(req, mockRes);

  // Check if cartData was populated
  if (!cartData) {
    throw new Error('No data returned from getOrCreateCart');
  }

  return cartData;
}

export {
  getOrCreateCart,
  addProductToCart,
  removeProductFromCart,
  deleteProductFromCart,
  mergeCartsOnLogin,
  deletePermanentCartOnLogout,
  getCartData
};