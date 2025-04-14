import { executeQuery } from '../db/executeQuery.js';

async function processPayment(paymentDetails, amount) {
  // Simulate a delay to represent external payment processing
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In this simulation, assume payment succeeds and return a dummy payment ID.
  return { success: true, paymentID: 'DUMMY_PAYMENT_ID' };
}

export const createOrder = async (customerID, paymentDetails) => {
  // Retrieve the customer's current cart
  const cartResults = await executeQuery(
    "SELECT * FROM Cart WHERE customerID = ?",
    [customerID]
  );
  if (!cartResults || cartResults.length === 0) {
    throw new Error("No cart found for customer");
  }
  const cart = cartResults[0];
  
  // Get cart items along with product prices from the database
  const cartItems = await executeQuery(
    `SELECT cc.productID, cc.quantity, p.unitPrice
     FROM CartContainsProduct cc
     JOIN Product p ON cc.productID = p.productID
     WHERE cc.cartID = ?`,
    [cart.cartID]
  );
  if (!cartItems || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  // Calculate the total price of the items in the cart
  let totalPrice = 0;
  for (const item of cartItems) {
    totalPrice += parseFloat(item.unitPrice) * item.quantity;
  }

  // Process the payment (simulated)
  const paymentResult = await processPayment(paymentDetails, totalPrice);
  if (!paymentResult.success) {
    throw new Error("Payment processing failed");
  }

  // Create a new order record in the Orders table with status 'Confirmed'
  const orderResult = await executeQuery(
    "INSERT INTO Orders (customerID, totalPrice, orderStatus, paymentInfo) VALUES (?, ?, 'Confirmed', ?)",
    [customerID, totalPrice, paymentResult.paymentID]
  );
  const orderID = orderResult.insertId;

  // Insert each item from the cart into the OrderItems table
  for (const item of cartItems) {
    await executeQuery(
      "INSERT INTO OrderItems (orderID, productID, quantity, unitPrice) VALUES (?, ?, ?, ?)",
      [orderID, item.productID, item.quantity, item.unitPrice]
    );
  }

  // Clear the customer's cart: remove cart items and reset totals
  await executeQuery("DELETE FROM CartContainsProduct WHERE cartID = ?", [cart.cartID]);
  await executeQuery("UPDATE Cart SET totalPrice = 0, numProducts = 0 WHERE cartID = ?", [cart.cartID]);

  // Retrieve and return the newly created order and its items
  const orderData = await executeQuery("SELECT * FROM Orders WHERE orderID = ?", [orderID]);
  const orderItems = await executeQuery("SELECT * FROM OrderItems WHERE orderID = ?", [orderID]);

  return { ...orderData[0], items: orderItems };
};
