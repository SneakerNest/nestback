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

const getOrdersByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const [orders] = await pool.query('SELECT * FROM `Order` WHERE timeOrdered BETWEEN ? AND ?', [startDate, endDate]);
    if (orders.length === 0) return res.status(404).json({ msg: 'No orders found' });
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving orders' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const username = req.username;
    const [users] = await pool.query('SELECT customerID FROM Customer WHERE username = ?', [username]);
    if (users.length === 0) return res.status(404).json({ msg: 'User not found' });
    const customerID = users[0].customerID;
    const [orders] = await pool.query('SELECT * FROM `Order` WHERE customerID = ?', [customerID]);
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving orders' });
  }
};

const getSupplierOrders = async (req, res) => {
  try {
    const username = req.username;
    const [supplierResult] = await pool.query(
      `SELECT supplierID FROM ProductManager WHERE username = ?
       UNION
       SELECT supplierID FROM SalesManager WHERE username = ?`,
      [username, username]
    );
    if (supplierResult.length === 0) return res.status(404).json({ msg: 'Manager not found' });

    const supplierID = supplierResult[0].supplierID;
    const [products] = await pool.query('SELECT productID FROM Product WHERE supplierID = ?', [supplierID]);

    const orderIDs = new Set();
    const orderItems = [];
    for (let product of products) {
      const [items] = await pool.query('SELECT * FROM OrderOrderItemsProduct WHERE productID = ?', [product.productID]);
      items.forEach(item => {
        orderItems.push(item);
        orderIDs.add(item.orderID);
      });
    }

    const finalResults = [];
    for (let orderID of orderIDs) {
      const [[order]] = await pool.query('SELECT * FROM `Order` WHERE orderID = ?', [orderID]);
      const [address] = await pool.query('SELECT * FROM Address WHERE addressID = ?', [order.deliveryAddressID]);
      const items = orderItems.filter(i => i.orderID === orderID);
      finalResults.push({ order, deliveryAddress: address[0], orderItems: items });
    }
    res.status(200).json(finalResults);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving supplier orders' });
  }
};

const getPurchasePrice = async (req, res) => {
  try {
    const { orderid, productid } = req.params;
    const [result] = await pool.query('SELECT purchasePrice FROM OrderOrderItemsProduct WHERE productID = ? AND orderID = ?', [productid, orderid]);
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving product' });
  }
};

const createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const username = req.username;
    const [[customer]] = await conn.query('SELECT customerID, addressID FROM Customer WHERE username = ?', [username]);
    const [[cart]] = await conn.query('SELECT * FROM Cart WHERE customerID = ? AND temporary = false', [customer.customerID]);
    const [cartItems] = await conn.query('SELECT * FROM CartContainsProduct WHERE cartID = ?', [cart.cartID]);

    for (let item of cartItems) {
      const [[stockCheck]] = await conn.query('SELECT stock FROM Product WHERE productID = ?', [item.productID]);
      if (stockCheck.stock < item.quantity) {
        await conn.rollback();
        return res.status(400).json({ msg: 'Insufficient stock' });
      }
    }

    const orderNumber = Math.floor(Math.random() * 1000000000);
    const deliveryID = Math.floor(Math.random() * 1000000000);
    const estimatedArrival = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    const [orderResult] = await conn.query(
      'INSERT INTO `Order` (orderNumber, totalPrice, deliveryID, deliveryStatus, deliveryAddressID, estimatedArrival, customerID, cartID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderNumber, cart.totalPrice, deliveryID, 'Processing', customer.addressID, estimatedArrival, customer.customerID, cart.cartID]
    );

    let orderTotal = 0;
    for (let item of cartItems) {
      const [[product]] = await conn.query('SELECT unitPrice, discountPercentage FROM Product WHERE productID = ?', [item.productID]);
      const purchasePrice = product.unitPrice * (1 - product.discountPercentage / 100);
      await conn.query(
        'INSERT INTO OrderOrderItemsProduct (orderID, productID, quantity, purchasePrice) VALUES (?, ?, ?, ?)', 
        [orderResult.insertId, item.productID, item.quantity, purchasePrice]
      );
      orderTotal += purchasePrice * item.quantity;
      await conn.query('UPDATE Product SET stock = stock - ? WHERE productID = ?', [item.quantity, item.productID]);
    }

    await conn.query('UPDATE `Order` SET totalPrice = ? WHERE orderID = ?', [orderTotal, orderResult.insertId]);

    await conn.query('DELETE FROM CartContainsProduct WHERE cartID = ?', [cart.cartID]);
    await conn.query('UPDATE Cart SET totalPrice = 0, numProducts = 0 WHERE cartID = ?', [cart.cartID]);
    
    await conn.commit();
    res.status(201).json({ msg: 'Order created', orderID: orderResult.insertId });
  } catch (err) {
    await conn.rollback();
    console.log(err);
    res.status(500).json({ msg: 'Error creating order' });
  } finally {
    conn.release();
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderID = req.params.id;
    if (req.body.addressID) {
      await pool.query('UPDATE `Order` SET deliveryAddressID = ? WHERE orderID = ?', [req.body.addressID, orderID]);
    }
    if (req.body.courierID) {
      await pool.query('UPDATE `Order` SET courierID = ? WHERE orderID = ?', [req.body.courierID, orderID]);
    }
    res.status(200).json({ msg: 'Order updated' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error updating order' });
  }
};

const updateOrderItems = async (req, res) => {
  try {
    const orderID = req.params.id;
    for (let product of req.body.products) {
      await pool.query('UPDATE OrderOrderItemsProduct SET quantity = ? WHERE productID = ? AND orderID = ?', [product.quantity, product.productID, orderID]);
    }
    const [[total]] = await pool.query('SELECT SUM(quantity * purchasePrice) AS totalPrice FROM OrderOrderItemsProduct WHERE orderID = ?', [orderID]);
    await pool.query('UPDATE `Order` SET totalPrice = ? WHERE orderID = ?', [total.totalPrice || 0, orderID]);
    res.status(200).json({ msg: 'Order items updated' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error updating order items' });
  }
};

const deleteOrderItem = async (req, res) => {
  try {
    const { orderid, productid } = req.params;
    const [[item]] = await pool.query('SELECT quantity FROM OrderOrderItemsProduct WHERE productID = ? AND orderID = ?', [productid, orderid]);
    await pool.query('DELETE FROM OrderOrderItemsProduct WHERE productID = ? AND orderID = ?', [productid, orderid]);
    await pool.query('UPDATE Product SET stock = stock + ? WHERE productID = ?', [item.quantity, productid]);
    const [[total]] = await pool.query('SELECT SUM(quantity * purchasePrice) AS totalPrice FROM OrderOrderItemsProduct WHERE orderID = ?', [orderid]);
    await pool.query('UPDATE `Order` SET totalPrice = ? WHERE orderID = ?', [total.totalPrice || 0, orderid]);
    res.status(200).json({ msg: 'Order item deleted and stock restored' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error deleting order item' });
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

const getAllOrder = async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM `Order` ORDER BY timeOrdered DESC');
    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving all orders' });
  }
};

// Wrapper function to get order data
const getOrderDataWrapper = async (req) => {
  try {
    let orderData;
    const mockRes = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        orderData = data;
      },
      send(data) {
        orderData = data;
      }
    };

    await getOrder(req, mockRes);

    if (!orderData) {
      throw new Error('No data returned from getOrder');
    }

    return orderData;
  } catch (err) {
    console.log(err);
    throw new Error('Error retrieving order data');
  }
};

export {
  getOrder,
  getOrdersByDateRange,
  getUserOrders,
  getSupplierOrders,
  getPurchasePrice,
  createOrder,
  updateOrder,
  cancelOrder,
  updateOrderItems,
  getOrderDataWrapper,
  deleteOrderItem,
  getAllOrder
};