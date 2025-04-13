import * as wishlistService from '../services/wishlistService.js';

export const getWishlist = async (req, res) => {
  try {
    // Assuming your authentication middleware attaches customerID to req.user.
    const wishlist = await wishlistService.fetchWishlist(req.user.customerID);
    res.json({ wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addWishlistItem = async (req, res) => {
  try {
    const { productID } = req.body;
    const wishlist = await wishlistService.addToWishlist(req.user.customerID, productID);
    res.json({ wishlist });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeWishlistItem = async (req, res) => {
  try {
    const { productID } = req.body;
    const wishlist = await wishlistService.deleteWishlistItem(req.user.customerID, productID);
    res.json({ wishlist });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
