import { executeQuery } from '../db/executeQuery.js';

/**
 * Retrieves the cart for a given customer.
 * If no cart exists, a new one is created.
 *
 * @param {number} customerID - The ID of the customer.
 * @returns {Object} The cart object including its items.
 */
export const fetchCart = async (customerID) => {
  // Look for an existing cart for this customer
  let carts = await executeQuery(
    "SELECT * FROM Cart WHERE customerID = ?",
    [customerID]
  );

  // If no cart exists, create one (set temporary to false for a logged-in user)
  if (carts.length === 0) {
    const result = await executeQuery(
      "INSERT INTO Cart (customerID, temporary, totalPrice, numProducts) VALUES (?, false, 0, 0)",
      [customerID]
    );
    // result.insertId is the newly created cart ID
    carts = await executeQuery(
      "SELECT * FROM Cart WHERE cartID = ?",
      [result.insertId]
    );
  }

  const cart = carts[0];

  // Retrieve items in the cart, joining with Product info to get the current price and name.
  const items = await executeQuery(
    `SELECT cc.productID, p.name, p.unitPrice, cc.quantity 
     FROM CartContainsProduct cc 
     JOIN Product p ON cc.productID = p.productID 
     WHERE cc.cartID = ?`,
    [cart.cartID]
  );

  return { ...cart, items };
};

/**
 * Adds a product (or increases its quantity) to the customer's cart.
 *
 * @param {number} customerID - The customer ID.
 * @param {number} productID - The product ID to add.
 * @param {number} quantity - The quantity to add.
 * @returns {Object} The updated cart.
 */
export const addToCart = async (customerID, productID, quantity) => {
  // Retrieve (or create) the customer's cart
  const cartData = await fetchCart(customerID);
  const cartID = cartData.cartID;

  // Check if the product already exists in the cart.
  const existing = await executeQuery(
    "SELECT * FROM CartContainsProduct WHERE cartID = ? AND productID = ?",
    [cartID, productID]
  );

  if (existing.length > 0) {
    // If it exists, update the quantity.
    await executeQuery(
      "UPDATE CartContainsProduct SET quantity = quantity + ? WHERE cartID = ? AND productID = ?",
      [quantity, cartID, productID]
    );
  } else {
    // Otherwise, insert a new row for this product.
    await executeQuery(
      "INSERT INTO CartContainsProduct (cartID, productID, quantity) VALUES (?, ?, ?)",
      [cartID, productID, quantity]
    );
  }

  // After adding/updating, recalculate the cart totals.
  await updateCartTotals(cartID);
  // Return the updated cart.
  return await fetchCart(customerID);
};

/**
 * Removes a product from the customer's cart.
 *
 * @param {number} customerID - The customer ID.
 * @param {number} productID - The product ID to remove.
 * @returns {Object} The updated cart.
 */
export const deleteCartItem = async (customerID, productID) => {
  const cartData = await fetchCart(customerID);
  const cartID = cartData.cartID;

  // Delete the product from the cart.
  await executeQuery(
    "DELETE FROM CartContainsProduct WHERE cartID = ? AND productID = ?",
    [cartID, productID]
  );

  // Recalculate the totals after deletion.
  await updateCartTotals(cartID);
  return await fetchCart(customerID);
};

/**
 * Helper function to recalculate and update total price and total item count
 * for a given cart.
 *
 * @param {number} cartID - The cart ID.
 */
const updateCartTotals = async (cartID) => {
  // Retrieve all items in the cart along with each product's unit price.
  const items = await executeQuery(
    `SELECT cc.productID, cc.quantity, p.unitPrice 
     FROM CartContainsProduct cc 
     JOIN Product p ON cc.productID = p.productID 
     WHERE cc.cartID = ?`,
    [cartID]
  );

  let newTotalPrice = 0;
  let newNumProducts = 0;
  items.forEach(item => {
    newTotalPrice += parseFloat(item.unitPrice) * item.quantity;
    newNumProducts += item.quantity;
  });

  await executeQuery(
    "UPDATE Cart SET totalPrice = ?, numProducts = ? WHERE cartID = ?",
    [newTotalPrice, newNumProducts, cartID]
  );
};
