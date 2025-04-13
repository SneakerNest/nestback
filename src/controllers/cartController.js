import * as cartService from '../services/cartService.js';

export const getCart = async (req, res) => {
  try {
    const cart = await cartService.fetchCart(req.user.customerID);
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addCartItem = async (req, res) => {
  try {
    const { productID, quantity } = req.body;
    const cart = await cartService.addToCart(
      req.user.customerID,
      productID,
      quantity
    );
    res.json({ cart });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  try {
    const { productID } = req.body;
    const cart = await cartService.deleteCartItem(
      req.user.customerID,
      productID
    );
    res.json({ cart });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
