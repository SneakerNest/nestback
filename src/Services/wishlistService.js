import { executeQuery } from '../db/executeQuery.js';

export const fetchWishlist = async (customerID) => {
  let wishlists = await executeQuery(
    "SELECT * FROM Wishlist WHERE customerID = ?",
    [customerID]
  );

  if (wishlists.length === 0) {
    const result = await executeQuery(
      "INSERT INTO Wishlist (customerID) VALUES (?)",
      [customerID]
    );
    wishlists = await executeQuery(
      "SELECT * FROM Wishlist WHERE wishlistID = ? AND customerID = ?",
      [result.insertId, customerID]
    );
  }
  const wishlist = wishlists[0];

  const items = await executeQuery(
    `SELECT wi.productID, p.name, p.unitPrice, p.discountPercentage, p.popularity 
     FROM WishlistItems wi 
     JOIN Product p ON wi.productID = p.productID 
     WHERE wi.wishlistID = ?`,
    [wishlist.wishlistID]
  );

  return { ...wishlist, items };
};

export const addToWishlist = async (customerID, productID) => {
  const wishlistData = await fetchWishlist(customerID);
  const wishlistID = wishlistData.wishlistID;

  const existing = await executeQuery(
    "SELECT * FROM WishlistItems WHERE wishlistID = ? AND productID = ?",
    [wishlistID, productID]
  );

  if (existing.length > 0) {
    return wishlistData;
  } else {
    await executeQuery(
      "INSERT INTO WishlistItems (wishlistID, productID) VALUES (?, ?)",
      [wishlistID, productID]
    );
  }

  return await fetchWishlist(customerID);
};

export const deleteWishlistItem = async (customerID, productID) => {
  const wishlistData = await fetchWishlist(customerID);
  const wishlistID = wishlistData.wishlistID;

  await executeQuery(
    "DELETE FROM WishlistItems WHERE wishlistID = ? AND productID = ?",
    [wishlistID, productID]
  );

  return await fetchWishlist(customerID);
};
