import { transporter } from './mailTransporter.js';
import { pool } from '../config/database.js';

/**
 * Sends email notification to customer when their refund request is approved
 */
export const sendRefundApprovalNotification = async (refundData) => {
  try {
    // Extract needed data from the refund object
    const { productName, customerEmail, customerName, orderNumber, quantity, purchasePrice, reason } = refundData;
    
    if (!customerEmail) {
      console.error('Cannot send refund notification: customer email is missing');
      return { success: false, message: 'Customer email is missing' };
    }
    
    console.log(`Sending refund approval notification to: ${customerEmail} for order: ${orderNumber}`);
    
    // Calculate refunded amount
    const refundAmount = (quantity * purchasePrice).toFixed(2);
    
    // Prepare email content
    const mailOptions = {
      from: 'sneakernest1@gmail.com',
      to: customerEmail,
      subject: `Refund Approved for Order #${orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://i.imgur.com/McnVCMF.jpg" alt="SneakerNest" style="max-width: 150px;">
          </div>
          
          <h2 style="color: #4CAF50; text-align: center;">Refund Approved!</h2>
          
          <p style="font-size: 16px;">Hello ${customerName},</p>
          <p style="font-size: 16px;">Great news! Your refund request has been approved:</p>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #333;">Refund Details</h3>
            <p><strong>Order Number:</strong> #${orderNumber}</p>
            <p><strong>Product:</strong> ${productName}</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Refund Amount:</strong> $${refundAmount}</p>
            <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
          </div>
          
          <p style="text-align: center; font-size: 16px;">The refunded amount will be credited back to your original payment method. This process may take 3-5 business days depending on your bank or credit card company.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000/profile" style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">View Your Orders</a>
          </div>
          
          <p style="color: #666; margin-top: 30px; font-size: 12px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Thank you for shopping with SneakerNest. We hope to see you again soon!<br>
            SneakerNest © 2024. All rights reserved.
          </p>
        </div>
      `
    };
    
    // Send the email
    const result = await transporter.sendMail(mailOptions);
    console.log(`Refund approval email sent successfully to ${customerEmail}, messageId: ${result.messageId}`);
    
    return { 
      success: true, 
      messageId: result.messageId,
      message: `Refund approval notification sent to ${customerEmail}` 
    };
    
  } catch (error) {
    console.error('Error in sendRefundApprovalNotification:', error);
    return { success: false, message: error.message };
  }
};