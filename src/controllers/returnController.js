import { pool } from '../config/database.js';


export const processReturn = async (req, res) => {
  const { orderID, productID, reason, quantity = 1 } = req.body;
  const username = req.username;
  
  if (!username) {
    return res.status(401).json({ message: 'Unauthorized: Username not available' });
  }

  console.log('Process return request:', { orderID, productID, reason, quantity, username });

  if (!orderID || !productID || !reason) {
    return res.status(400).json({ message: 'Missing required fields: orderID, productID, and reason are required' });
  }

  let conn;

  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [customerRows] = await conn.query('SELECT customerID FROM Customer WHERE username = ?', [username]);
    if (!customerRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Customer not found' });
    }

    const customerID = customerRows[0].customerID;

    const [existingReturnRows] = await conn.query(
      'SELECT * FROM Returns WHERE orderID = ? AND productID = ? AND customerID = ?', 
      [orderID, productID, customerID]
    );
    if (existingReturnRows.length > 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'You have already submitted a return for this product' });
    }

    const [orderRows] = await conn.query(
      `SELECT o.*, op.quantity as purchasedQuantity, op.purchasePrice 
       FROM \`Order\` o
       JOIN OrderOrderItemsProduct op ON o.orderID = op.orderID
       WHERE o.orderID = ? AND o.customerID = ? AND op.productID = ?`,
      [orderID, customerID, productID]
    );

    if (!orderRows.length) {
      await conn.rollback();
      return res.status(404).json({ message: 'Order not found or does not belong to you' });
    }

    const order = orderRows[0];

    if (order.deliveryStatus.toLowerCase() !== 'delivered') {
      await conn.rollback();
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }

    const deliveredDate = new Date(order.timeOrdered);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    if (deliveredDate < oneMonthAgo) {
      await conn.rollback();
      return res.status(400).json({ message: 'Return period expired (must be within one month of delivery)' });
    }

    if (quantity > order.purchasedQuantity) {
      await conn.rollback();
      return res.status(400).json({ message: 'Return quantity cannot exceed purchased quantity' });
    }

    const [salesManagers] = await conn.query('SELECT username FROM SalesManager LIMIT 1');
    let salesManagerUsername = null;

    if (salesManagers.length > 0) {
      salesManagerUsername = salesManagers[0].username;
    } else {
      await conn.query(
        'INSERT INTO SalesManager (username, name, email) VALUES (?, ?, ?)',
        ['system_manager', 'System Manager', 'system@example.com']
      );
      salesManagerUsername = 'system_manager';
    }

    const refundAmount = parseFloat(order.purchasePrice) * quantity;

    const [returnResult] = await conn.query(
      'INSERT INTO Returns (returnStatus, reason, orderID, productID, quantity, customerID) VALUES (?, ?, ?, ?, ?, ?)',
      ['pending', reason, orderID, productID, quantity, customerID]
    );

    if (!returnResult.insertId) {
      await conn.rollback();
      return res.status(500).json({ message: 'Failed to create return record' });
    }

    const returnID = returnResult.insertId;

    // INSERT approval record with fallback
    try {
      await conn.query(
        'INSERT INTO SalesManagerApprovesRefundReturn (requestID, salesManagerUsername, approvalStatus) VALUES (?, ?, ?)',
        [returnID, salesManagerUsername, 'pending']
      );
    } catch (insertError) {
      console.warn('Initial insert failed, trying fallback schema:', insertError.code);

      try {
        await conn.query(
          'INSERT INTO SalesManagerApprovesRefundReturn (requestID, username, status) VALUES (?, ?, ?)',
          [returnID, salesManagerUsername, 'pending']
        );
      } catch (fallbackError) {
        console.error('Fallback insert also failed:', fallbackError);
        throw fallbackError; // Let main catch handle it
      }
    }

    await conn.commit();

    console.log('Return request processed successfully');
    res.status(200).json({
      message: 'Return request submitted successfully',
      requestID: returnID,
      potentialRefundAmount: refundAmount
    });

  } catch (error) {
    console.error('Return processing error:', error);

    if (conn) await conn.rollback();

    res.status(500).json({
      message: 'Error processing return request',
      error: error.message,
      sqlCode: error.code,
      sqlState: error.sqlState
    });
  } finally {
    if (conn) conn.release();
  }
};


export const getCustomerReturns = async (req, res) => {
  try {
    const username = req.username;
    console.log('Getting returns for username:', username);
    
    // First get the customer ID
    const [customerRows] = await pool.query(
      'SELECT customerID FROM Customer WHERE username = ?', 
      [username]
    );
    
    if (customerRows.length === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customerID = customerRows[0].customerID;
    console.log('CustomerID for returns:', customerID);
    
    // Use a simpler query first to make sure basic data is returned
    const [basicReturns] = await pool.query(
      'SELECT * FROM Returns WHERE customerID = ?',
      [customerID]
    );
    
    console.log(`Found ${basicReturns.length} basic returns for customer ${customerID}`);
    
    // If we have basic returns, get the full details
    if (basicReturns.length > 0) {
      const [fullReturns] = await pool.query(
        `SELECT 
          r.*, 
          o.orderNumber,
          p.name AS productName,
          COALESCE(smr.approvalStatus, 'pending') AS approvalStatus
        FROM Returns r
        LEFT JOIN \`Order\` o ON r.orderID = o.orderID
        LEFT JOIN Product p ON r.productID = p.productID
        LEFT JOIN SalesManagerApprovesRefundReturn smr ON r.requestID = smr.requestID
        WHERE r.customerID = ?
        ORDER BY r.requestID DESC`,
        [customerID]
      );
      
      console.log('Returning full return details:', fullReturns);
      return res.status(200).json(fullReturns);
    }
    
    return res.status(200).json([]);
  } catch (error) {
    console.error('Error in getCustomerReturns:', error);
    return res.status(500).json({ 
      message: 'Error retrieving return requests', 
      error: error.message 
    });
  }
};

export const approveReturn = async (req, res) => {
  const { requestID } = req.params;
  const username = req.username;
  
  if (!username) {
    return res.status(401).json({ message: 'Unauthorized: Username not available' });
  }

  try {
    // Check if user is a sales manager
    const [managerResult] = await pool.query(
      'SELECT * FROM SalesManager WHERE username = ?',
      [username]
    );

    if (managerResult.length === 0) {
      return res.status(403).json({ message: 'Only sales managers can approve returns' });
    }

    // Begin transaction
    await pool.query('START TRANSACTION');

    // Update return status
    await pool.query(
      'UPDATE Returns SET returnStatus = ? WHERE requestID = ?',
      ['approved', requestID]
    );

    // Update approval record
    await pool.query(
      'UPDATE SalesManagerApprovesRefundReturn SET salesManagerUsername = ?, approvalStatus = ? WHERE requestID = ?',
      [username, 'approved', requestID]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({ message: 'Return request approved successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error approving return:', error);
    res.status(500).json({ message: 'Failed to approve return', error: error.message });
  }
};

export const rejectReturn = async (req, res) => {
  const { requestID } = req.params;
  const { rejectionReason } = req.body;
  const username = req.username;
  
  if (!username) {
    return res.status(401).json({ message: 'Unauthorized: Username not available' });
  }

  try {
    // Check if user is a sales manager
    const [managerResult] = await pool.query(
      'SELECT * FROM SalesManager WHERE username = ?',
      [username]
    );

    if (managerResult.length === 0) {
      return res.status(403).json({ message: 'Only sales managers can reject returns' });
    }

    // Begin transaction
    await pool.query('START TRANSACTION');

    // Update return status
    await pool.query(
      'UPDATE Returns SET returnStatus = ? WHERE requestID = ?',
      ['rejected', requestID]
    );

    // Update approval record
    await pool.query(
      'UPDATE SalesManagerApprovesRefundReturn SET salesManagerUsername = ?, approvalStatus = ? WHERE requestID = ?',
      [username, 'rejected', requestID]
    );

    // Commit transaction
    await pool.query('COMMIT');

    res.status(200).json({ message: 'Return request rejected' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error rejecting return:', error);
    res.status(500).json({ message: 'Failed to reject return', error: error.message });
  }
};

export default {
  processReturn,
  getCustomerReturns,
  approveReturn,
  rejectReturn
};