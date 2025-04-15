import { pool } from '../config/database.js';

const getOrder = async (req, res) => {
  try {
    const orderID = req.params.id;

    const [orders] = await pool.query('SELECT * FROM `Order` WHERE orderID = ?', [orderID]);
    if (orders.length === 0) return res.status(404).json({ msg: 'Order not found' });

    const [items] = await pool.query('SELECT * FROM OrderOrderItemsProduct WHERE orderID = ?', [orderID]);

    for (let item of items) {
      const [product] = await pool.query('SELECT name FROM Product WHERE productID = ?', [item.productID]);
      item.productName = product[0].name;
    }

    orders[0].orderItems = items;
    res.status(200).json(orders[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving order' });
  }
};

const getUserOrders = async (req, res) => {
    try {
      console.log('Decoded user:', req.user);
  
      const username = req.user?.username;
      if (!username) {
        return res.status(400).json({ msg: 'Username missing from token' });
      }
  
      const [users] = await pool.query('SELECT customerID FROM Customer WHERE username = ?', [username]);
      if (users.length === 0) {
        console.log('No customer found for username:', username);
        return res.status(404).json({ msg: 'User not found' });
      }
  
      const customerID = users[0].customerID;
      const [orders] = await pool.query('SELECT * FROM `Order` WHERE customerID = ?', [customerID]);
  
      res.status(200).json(orders);
    } catch (err) {
      console.log('Error during getUserOrders:', err);
      res.status(500).json({ msg: 'Error retrieving orders' });
    }
  };

const getOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const [orders] = await pool.query('SELECT orderID FROM `Order` WHERE timeOrdered BETWEEN ? AND ?', [startDate, endDate]);

    if (orders.length === 0) return res.status(404).json({ msg: 'No orders found' });
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving orders' });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderID = req.params.id;
    const [[order]] = await pool.query('SELECT deliveryStatus FROM `Order` WHERE orderID = ?', [orderID]);

    if (!order || ['Delivering', 'Delivered'].includes(order.deliveryStatus)) {
      return res.status(400).json({ msg: 'Cannot cancel delivered or delivering order' });
    }

    await pool.query('UPDATE `Order` SET deliveryStatus = ? WHERE orderID = ?', ['Cancelled', orderID]);

    const [items] = await pool.query('SELECT productID, quantity FROM OrderOrderItemsProduct WHERE orderID = ?', [orderID]);
    for (let item of items) {
      await pool.query('UPDATE Product SET stock = stock + ? WHERE productID = ?', [item.quantity, item.productID]);
    }

    res.status(200).json({ msg: 'Order cancelled and stock updated' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error cancelling order' });
  }
};

const getPurchasePrice = async (req, res) => {
  try {
    const { orderid, productid } = req.params;
    const [result] = await pool.query(
      'SELECT purchasePrice FROM OrderOrderItemsProduct WHERE productID = ? AND orderID = ?',
      [productid, orderid]
    );
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving product' });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM `Order` ORDER BY timeOrdered');
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving orders' });
  }
};

const getOrderWrapper = async (req) => {
  let data;
  const mockRes = {
    status(code) { this.statusCode = code; return this; },
    json(val) { data = val; },
    send(val) { data = val; }
  };
  await getOrder(req, mockRes);
  if (!data) throw new Error('No order data');
  return data;
};

export {
  getOrder,
  getUserOrders,
  getOrdersByDateRange,
  cancelOrder,
  getPurchasePrice,
  getAllOrder,
  getOrderWrapper
};