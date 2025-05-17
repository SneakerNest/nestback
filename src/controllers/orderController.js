import { pool } from '../config/database.js';

// Update the getOrder function to be more robust in fetching address
const getOrder = async (req, res) => {
  try {
    const orderID = req.params.id;
    const [orders] = await pool.query('SELECT * FROM `Order` WHERE orderID = ?', [orderID]);
    if (orders.length === 0) return res.status(404).json({ msg: 'Order not found' });

    const order = orders[0];
    console.log(`Fetching details for order ${orderID}, delivery address ID: ${order.deliveryAddressID}`);

    // Explicitly join the order with address information
    const [orderWithAddress] = await pool.query(
      `SELECT o.*, 
        a.addressID, a.addressTitle, a.streetAddress, a.city, 
        a.province, a.zipCode, a.country
       FROM \`Order\` o
       LEFT JOIN Address a ON o.deliveryAddressID = a.addressID
       WHERE o.orderID = ?`,
      [orderID]
    );
    
    if (orderWithAddress.length > 0) {
      // Format the full address information
      order.deliveryAddress = {
        addressID: orderWithAddress[0].addressID,
        addressTitle: orderWithAddress[0].addressTitle,
        streetAddress: orderWithAddress[0].streetAddress,
        city: orderWithAddress[0].city,
        province: orderWithAddress[0].province,
        zipCode: orderWithAddress[0].zipCode,
        country: orderWithAddress[0].country
      };
      
      console.log('Address information found:', order.deliveryAddress);
    } else {
      console.log('No address information found for order');
      
      // Fallback: If no address in order, try to get customer's default address
      const [customerAddress] = await pool.query(
        `SELECT a.*
         FROM Customer c
         JOIN Address a ON c.addressID = a.addressID
         WHERE c.customerID = ?`,
        [order.customerID]
      );
      
      if (customerAddress.length > 0) {
        order.deliveryAddress = customerAddress[0];
        console.log('Using customer default address as fallback');
      }
    }

    // Get order items with product names
    const [items] = await pool.query('SELECT * FROM OrderOrderItemsProduct WHERE orderID = ?', [orderID]);
    for (let item of items) {
      const [product] = await pool.query('SELECT name, size FROM Product WHERE productID = ?', [item.productID]);
      item.productName = product[0].name;
      item.size = product[0].size;
    }
    
    order.orderItems = items;
    res.status(200).json(order);
  } catch (err) {
    console.log('Error retrieving order:', err);
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

    // Modified query to properly get all order details
    const [orders] = await pool.query(`
      SELECT 
        o.orderID,
        o.orderNumber,
        o.timeOrdered,
        o.deliveryStatus,
        o.totalPrice,
        o.deliveryID,
        o.estimatedArrival,
        p.productID,
        p.name as productName,
        oi.quantity,
        oi.purchasePrice,
        p.size
      FROM \`Order\` o
      LEFT JOIN OrderOrderItemsProduct oi ON o.orderID = oi.orderID
      LEFT JOIN Product p ON oi.productID = p.productID
      WHERE o.customerID = ?
      ORDER BY o.timeOrdered DESC`, 
      [customerID]
    );

    // Add debug logging
    console.log('Raw orders from database:', orders);

    // Group the results by order
    const formattedOrders = orders.reduce((acc, curr) => {
      const existingOrder = acc.find(order => order.orderID === curr.orderID);
      
      if (existingOrder) {
        if (curr.productID) {
          existingOrder.products.push({
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice,
            size: curr.size
          });
        }
      } else {
        acc.push({
          orderID: curr.orderID,
          orderNumber: curr.orderNumber,
          timeOrdered: curr.timeOrdered,
          deliveryStatus: curr.deliveryStatus,
          totalPrice: curr.totalPrice,
          deliveryID: curr.deliveryID,
          estimatedArrival: curr.estimatedArrival,
          products: curr.productID ? [{
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice,
            size: curr.size
          }] : []
        });
      }
      return acc;
    }, []);

    // Add debug logging
    console.log('Formatted orders:', formattedOrders);

    res.status(200).json(formattedOrders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving orders' });
  }
};

// Update the getUserActiveOrders function to include delivery address
const getUserActiveOrders = async (req, res) => {
  try {
    const username = req.username;
    const [users] = await pool.query('SELECT customerID FROM Customer WHERE username = ?', [username]);
    if (users.length === 0) return res.status(404).json({ msg: 'User not found' });
    
    const customerID = users[0].customerID;

    // Modified query to include address information
    const [orders] = await pool.query(`
      SELECT 
        o.orderID,
        o.orderNumber,
        o.timeOrdered,
        o.deliveryStatus,
        o.totalPrice,
        o.deliveryID,
        o.estimatedArrival,
        oi.productID,
        p.name as productName,
        oi.quantity,
        oi.purchasePrice,
        a.addressTitle,
        a.streetAddress,
        a.city,
        a.province,
        a.zipCode,
        a.country
      FROM \`Order\` o
      LEFT JOIN OrderOrderItemsProduct oi ON o.orderID = oi.orderID
      LEFT JOIN Product p ON oi.productID = p.productID
      LEFT JOIN Address a ON o.deliveryAddressID = a.addressID
      WHERE o.customerID = ? AND o.deliveryStatus IN ('Processing', 'In-transit')
      ORDER BY o.timeOrdered DESC`, 
      [customerID]
    );

    // Group products by order and include delivery address
    const formattedOrders = orders.reduce((acc, curr) => {
      const existingOrder = acc.find(order => order.orderID === curr.orderID);
      
      if (existingOrder) {
        if (curr.productID) {
          existingOrder.products.push({
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice
          });
        }
      } else {
        acc.push({
          orderID: curr.orderID,
          orderNumber: curr.orderNumber,
          timeOrdered: curr.timeOrdered,
          deliveryStatus: curr.deliveryStatus,
          totalPrice: curr.totalPrice,
          deliveryID: curr.deliveryID,
          estimatedArrival: curr.estimatedArrival,
          deliveryAddress: {
            addressTitle: curr.addressTitle,
            streetAddress: curr.streetAddress,
            city: curr.city,
            province: curr.province,
            zipCode: curr.zipCode,
            country: curr.country
          },
          products: curr.productID ? [{
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice
          }] : []
        });
      }
      return acc;
    }, []);

    res.status(200).json(formattedOrders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving active orders' });
  }
};

const getUserPastOrders = async (req, res) => {
  try {
    const username = req.username;
    const [users] = await pool.query('SELECT customerID FROM Customer WHERE username = ?', [username]);
    if (users.length === 0) return res.status(404).json({ msg: 'User not found' });
    
    const customerID = users[0].customerID;

    // Modified query to get delivered orders with review status
    const [orders] = await pool.query(`
      SELECT 
        o.orderID,
        o.orderNumber,
        o.timeOrdered,
        o.deliveryStatus,
        o.totalPrice,
        o.deliveryID,
        o.estimatedArrival,
        oi.productID,
        p.name as productName,
        oi.quantity,
        oi.purchasePrice,
        EXISTS(
          SELECT 1 FROM Review r 
          WHERE r.productID = p.productID 
          AND r.customerID = ? 
          AND r.reviewContent IS NOT NULL
        ) as reviewed,
        EXISTS(
          SELECT 1 FROM Review r 
          WHERE r.productID = p.productID 
          AND r.customerID = ? 
          AND r.reviewStars IS NOT NULL
        ) as rated
      FROM \`Order\` o
      LEFT JOIN OrderOrderItemsProduct oi ON o.orderID = oi.orderID
      LEFT JOIN Product p ON oi.productID = p.productID
      WHERE o.customerID = ? 
      AND o.deliveryStatus = 'Delivered'
      ORDER BY o.timeOrdered DESC`, 
      [customerID, customerID, customerID]
    );

    // Group products by order
    const formattedOrders = orders.reduce((acc, curr) => {
      const existingOrder = acc.find(order => order.orderID === curr.orderID);
      
      if (existingOrder) {
        if (curr.productID) {
          existingOrder.products.push({
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice,
            rated: curr.rated === 1,
            reviewed: curr.reviewed === 1
          });
        }
      } else {
        acc.push({
          orderID: curr.orderID,
          orderNumber: curr.orderNumber,
          timeOrdered: curr.timeOrdered,
          deliveryStatus: curr.deliveryStatus,
          totalPrice: curr.totalPrice,
          deliveryID: curr.deliveryID,
          estimatedArrival: curr.estimatedArrival,
          products: curr.productID ? [{
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice,
            rated: curr.rated === 1,
            reviewed: curr.reviewed === 1
          }] : []
        });
      }
      return acc;
    }, []);

    console.log('Past orders:', formattedOrders); // Debug log
    res.status(200).json(formattedOrders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving past orders' });
  }
};

const getUserCancelledOrders = async (req, res) => {
  try {
    const username = req.username;
    const [users] = await pool.query('SELECT customerID FROM Customer WHERE username = ?', [username]);
    if (users.length === 0) return res.status(404).json({ msg: 'User not found' });
    
    const customerID = users[0].customerID;

    // Get only cancelled orders
    const [orders] = await pool.query(`
      SELECT 
        o.orderID,
        o.orderNumber,
        o.timeOrdered,
        o.deliveryStatus,
        o.totalPrice,
        o.deliveryID,
        o.estimatedArrival,
        oi.productID,
        p.name as productName,
        oi.quantity,
        oi.purchasePrice
      FROM \`Order\` o
      LEFT JOIN OrderOrderItemsProduct oi ON o.orderID = oi.orderID
      LEFT JOIN Product p ON oi.productID = p.productID
      WHERE o.customerID = ? 
      AND o.deliveryStatus = 'cancelled'
      ORDER BY o.timeOrdered DESC`, 
      [customerID]
    );

    // Group products by order
    const formattedOrders = orders.reduce((acc, curr) => {
      const existingOrder = acc.find(order => order.orderID === curr.orderID);
      
      if (existingOrder) {
        if (curr.productID) {
          existingOrder.products.push({
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice
          });
        }
      } else {
        acc.push({
          orderID: curr.orderID,
          orderNumber: curr.orderNumber,
          timeOrdered: curr.timeOrdered,
          deliveryStatus: curr.deliveryStatus,
          totalPrice: curr.totalPrice,
          deliveryID: curr.deliveryID,
          estimatedArrival: curr.estimatedArrival,
          products: curr.productID ? [{
            productID: curr.productID,
            name: curr.productName,
            quantity: curr.quantity,
            purchasePrice: curr.purchasePrice
          }] : []
        });
      }
      return acc;
    }, []);

    res.status(200).json(formattedOrders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error retrieving cancelled orders' });
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

// Update the createOrder function to ensure address is properly linked
const createOrder = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const username = req.username;
    
    // Get customer data with address information
    const [[customer]] = await conn.query(
      'SELECT c.customerID, c.addressID, a.* FROM Customer c ' +
      'JOIN Address a ON c.addressID = a.addressID ' +
      'WHERE c.username = ?', 
      [username]
    );
    
    console.log('Creating order with customer address data:', {
      customerID: customer.customerID,
      addressID: customer.addressID,
      addressTitle: customer.addressTitle
    });

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

    // When inserting the order, explicitly use customer.addressID
    const [orderResult] = await conn.query(
      'INSERT INTO `Order` (orderNumber, totalPrice, deliveryID, deliveryStatus, deliveryAddressID, estimatedArrival, customerID, cartID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderNumber, cart.totalPrice, deliveryID, 'Processing', customer.addressID, estimatedArrival, customer.customerID, cart.cartID]
    );
    
    // Print debug info
    console.log(`Order created with ID ${orderResult.insertId}, using address ID ${customer.addressID}`);
    
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
    const { id } = req.params;
    const username = req.username;
    
    // Check if order exists and belongs to this user
    const [orderRows] = await pool.query(
      `SELECT o.* FROM \`Order\` o
       JOIN Customer c ON o.customerID = c.customerID
       WHERE o.orderID = ? AND c.username = ?`,
      [id, username]
    );
    
    if (orderRows.length === 0) {
      return res.status(404).json({ message: 'Order not found or does not belong to you' });
    }
    
    const order = orderRows[0];
    
    // Check if order is in processing status
    if (order.deliveryStatus.toLowerCase() !== 'processing') {
      return res.status(400).json({ 
        message: 'Only orders in "processing" status can be cancelled' 
      });
    }
    
    // Update order status to cancelled
    await pool.query(
      'UPDATE `Order` SET deliveryStatus = ? WHERE orderID = ?',
      ['cancelled', id]
    );
    
    // Update inventory to return products to stock
    const [orderItems] = await pool.query(
      'SELECT productID, quantity FROM OrderOrderItemsProduct WHERE orderID = ?',
      [id]
    );
    
    // Begin transaction for inventory updates
    await pool.query('START TRANSACTION');
    
    try {
      // Return each product to inventory
      for (const item of orderItems) {
        await pool.query(
          'UPDATE Product SET stock = stock + ? WHERE productID = ?',
          [item.quantity, item.productID]
        );
      }
      
      await pool.query('COMMIT');
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
    
    return res.status(200).json({ 
      message: 'Order cancelled successfully',
      orderID: id
    });
    
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Failed to cancel order', error: error.message });
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
  getUserActiveOrders,
  getUserPastOrders,
  getUserCancelledOrders,
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