import { executeQuery } from '../db/executeQuery.js';

/**
 * Retrieves the wishlist for a given customer.
 * If no wishlist exists, a new one is created.
 *
 * @param {number} customerID - The ID of the customer.
 * @returns {Object} The wishlist object including its items.
 */
export const fetchWishlist = async (customerID) => {
  // Look for an existing wishlist for the customer.
  let wishlists = await executeQuery(
    "SELECT * FROM Wishlist WHERE customerID = ?",
    [customerID]
  );

  // If no wishlist exists, create one.
  if (wishlists.length === 0) {
    const result = await executeQuery(
      "INSERT INTO Wishlist (customerID) VALUES (?)",
      [customerID]
    );
    // Retrieve the newly created wishlist using the insert ID.
    wishlists = await executeQuery(
      "SELECT * FROM Wishlist WHERE wishlistID = ? AND customerID = ?",
      [result.insertId, customerID]
    );
  }
  const wishlist = wishlists[0];

  // Retrieve products added to the wishlist by joining with the Product table.
  const items = await executeQuery(
    `SELECT wi.productID, p.name, p.unitPrice, p.discountPercentage, p.popularity 
     FROM WishlistItems wi 
     JOIN Product p ON wi.productID = p.productID 
     WHERE wi.wishlistID = ?`,
    [wishlist.wishlistID]
  );

  return { ...wishlist, items };
};

/**
 * Adds a product to the customer's wishlist.
 *
 * @param {number} customerID - The customer's ID.
 * @param {number} productID - The product ID to add.
 * @returns {Object} The updated wishlist.
 */
export const addToWishlist = async (customerID, productID) => {
  // Retrieve (or create) the customer's wishlist.
  const wishlistData = await fetchWishlist(customerID);
  const wishlistID = wishlistData.wishlistID;

  // Check if the product already exists in the wishlist.
  const existing = await executeQuery(
    "SELECT * FROM WishlistItems WHERE wishlistID = ? AND productID = ?",
    [wishlistID, productID]
  );

  if (existing.length > 0) {
    // If it already exists, return the current wishlist without inserting a duplicate.
    return wishlistData;
  } else {
    // Insert the product into the wishlist.
    await executeQuery(
      "INSERT INTO WishlistItems (wishlistID, productID) VALUES (?, ?)",
      [wishlistID, productID]
    );
  }

  // Return the updated wishlist.
  return await fetchWishlist(customerID);
};

/**
 * Removes a product from the customer's wishlist.
 *
 * @param {number} customerID - The customer's ID.
 * @param {number} productID - The product ID to remove.
 * @returns {Object} The updated wishlist.
 */
export const deleteWishlistItem = async (customerID, productID) => {
  const wishlistData = await fetchWishlist(customerID);
  const wishlistID = wishlistData.wishlistID;

  // Remove the product from the wishlist.
  await executeQuery(
    "DELETE FROM WishlistItems WHERE wishlistID = ? AND productID = ?",
    [wishlistID, productID]
  );

  // Return the updated wishlist.
  return await fetchWishlist(customerID);
};
