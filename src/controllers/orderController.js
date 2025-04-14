import { createOrder } from "../services/orderService.js";

export const placeOrder = async (req, res) => {
  try {
    const customerID = req.user.customerID;
    const { items, paymentInfo } = req.body;

    const order = await createOrder(customerID, items, paymentInfo);
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
