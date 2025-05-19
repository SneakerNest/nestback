import { pool } from '../config/database.js';
import { sendRefundApprovalNotification } from '../Services/refundNotifier.js';

// Get all refund requests
export const getAllRefundRequests = async (req, res) => {
  try {
    const [refunds] = await pool.query(`
      SELECT r.*, 
        o.orderNumber,
        p.name AS productName,
        p.productID,
        oi.quantity AS originalQuantity,
        oi.purchasePrice,
        c.username AS customerUsername,
        u.name AS customerName,
        u.email AS customerEmail,
        IFNULL(smr.approvalStatus, 'Pending') as status
      FROM Returns r
      JOIN \`Order\` o ON r.orderID = o.orderID
      JOIN OrderOrderItemsProduct oi ON r.orderID = oi.orderID AND r.productID = oi.productID
      JOIN Product p ON r.productID = p.productID
      JOIN Customer c ON r.customerID = c.customerID
      JOIN USERS u ON c.username = u.username
      LEFT JOIN SalesManagerApprovesRefundReturn smr ON r.requestID = smr.requestID
      ORDER BY r.requestID DESC
    `);
    
    // Map column names to expected format
    const formattedRefunds = refunds.map(refund => ({
      refundID: refund.requestID,
      orderID: refund.orderID,
      productID: refund.productID,
      quantity: refund.quantity,
      status: refund.status || refund.returnStatus,
      reason: refund.reason,
      requestDate: refund.requestDate || new Date(Date.now() - 7*24*60*60*1000), // Fallback if no date
      responseDate: refund.responseDate,
      declineReason: refund.declineReason,
      orderNumber: refund.orderNumber,
      productName: refund.productName,
      originalQuantity: refund.originalQuantity,
      purchasePrice: refund.purchasePrice,
      customerUsername: refund.customerUsername,
      customerName: refund.customerName,
      customerEmail: refund.customerEmail
    }));
    
    res.status(200).json(formattedRefunds);
  } catch (error) {
    console.error('Error fetching refund requests:', error);
    res.status(500).json({ message: 'Failed to fetch refund requests', error: error.message });
  }
};

// Approve a refund request
export const approveRefundRequest = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { refundID } = req.params;
    const salesManagerUsername = req.username; // Get username from auth token
    
    // Get refund request details
    const [[refundRequest]] = await connection.query(
      'SELECT * FROM Returns WHERE requestID = ?',
      [refundID]
    );
    
    if (!refundRequest) {
      await connection.rollback();
      return res.status(404).json({ message: 'Refund request not found' });
    }
    
    // Update product stock - increase by refunded quantity
    await connection.query(
      'UPDATE Product SET stock = stock + ? WHERE productID = ?',
      [refundRequest.quantity, refundRequest.productID]
    );
    
    // Update return status
    await connection.query(
      'UPDATE Returns SET returnStatus = "Approved" WHERE requestID = ?',
      [refundID]
    );
    
    // Record which sales manager approved the refund
    await connection.query(
      'INSERT INTO SalesManagerApprovesRefundReturn (requestID, salesManagerUsername, approvalStatus) VALUES (?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE salesManagerUsername = VALUES(salesManagerUsername), approvalStatus = VALUES(approvalStatus)',
      [refundID, salesManagerUsername, 'Approved']
    );
    
    // If this is a complete order refund, mark the order as refunded
    const [[orderItem]] = await connection.query(
      'SELECT oi.quantity, r.quantity as refundQuantity FROM OrderOrderItemsProduct oi ' +
      'JOIN Returns r ON oi.orderID = r.orderID AND oi.productID = r.productID ' +
      'WHERE r.requestID = ?',
      [refundID]
    );
    
    if (orderItem && orderItem.quantity === orderItem.refundQuantity) {
      await connection.query(
        'UPDATE `Order` SET deliveryStatus = "Refunded" WHERE orderID = ?',
        [refundRequest.orderID]
      );
    }
    
    await connection.commit();
    
    // Gather additional data needed for the email notification
    const [[orderData]] = await connection.query(
      `SELECT o.orderNumber FROM \`Order\` o WHERE o.orderID = ?`,
      [refundRequest.orderID]
    );
    
    const [[productData]] = await connection.query(
      `SELECT p.name as productName, p.unitPrice FROM Product p WHERE p.productID = ?`,
      [refundRequest.productID]
    );
    
    const [[userData]] = await connection.query(
      `SELECT u.name as customerName, u.email as customerEmail 
       FROM Customer c
       JOIN USERS u ON c.username = u.username
       WHERE c.customerID = ?`,
      [refundRequest.customerID]
    );
    
    // Send email notification to customer
    const emailResult = await sendRefundApprovalNotification({
      productName: productData.productName,
      customerEmail: userData.customerEmail,
      customerName: userData.customerName,
      orderNumber: orderData.orderNumber,
      quantity: refundRequest.quantity,
      purchasePrice: orderItem.purchasePrice || productData.unitPrice,
      reason: refundRequest.reason
    });
    
    if (!emailResult.success) {
      console.warn('Failed to send refund approval email:', emailResult.message);
    }
    
    res.status(200).json({ 
      message: 'Refund approved successfully',
      refundID: refundID,
      productID: refundRequest.productID,
      quantityRestored: refundRequest.quantity,
      notificationSent: emailResult.success
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error approving refund request:', error);
    res.status(500).json({ message: 'Failed to approve refund request', error: error.message });
  } finally {
    connection.release();
  }
};

// Decline a refund request
export const declineRefundRequest = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { refundID } = req.params;
    const { declineReason } = req.body;
    const salesManagerUsername = req.username; // Get username from auth token
    
    // Update return status
    const [result] = await connection.query(
      'UPDATE Returns SET returnStatus = "Declined" WHERE requestID = ?',
      [declineReason || 'Request declined by manager', refundID]
    );
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Refund request not found' });
    }
    
    // Record which sales manager declined the refund
    await connection.query(
      'INSERT INTO SalesManagerApprovesRefundReturn (requestID, salesManagerUsername, approvalStatus) VALUES (?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE salesManagerUsername = VALUES(salesManagerUsername), approvalStatus = VALUES(approvalStatus)',
      [refundID, salesManagerUsername, 'Declined']
    );
    
    await connection.commit();
    
    res.status(200).json({ 
      message: 'Refund request declined',
      refundID: refundID
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error declining refund request:', error);
    res.status(500).json({ message: 'Failed to decline refund request', error: error.message });
  } finally {
    connection.release();
  }
};