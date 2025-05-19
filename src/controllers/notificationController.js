import { sendDiscountNotifications } from '../Services/discountNotifier.js';

/**
 * Controller function to handle discount notifications for wishlist items
 * This is called when a product receives a discount
 */
export const sendWishlistDiscountNotifications = async (req, res) => {
  try {
    const { productID, discountPercentage, unitPrice } = req.body;
    
    console.log(`Notification controller received request for product ${productID} with ${discountPercentage}% discount`);
    
    // Validate input
    if (!productID || !discountPercentage || !unitPrice) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: productID, discountPercentage, and unitPrice are required' 
      });
    }
    
    // Call the notification service
    const result = await sendDiscountNotifications(productID, discountPercentage, unitPrice);
    
    console.log('Notification result:', result);
    
    return res.status(200).json({
      success: result.success,
      sent: result.sent || 0,
      message: result.message
    });
  } catch (error) {
    console.error('Error in sendWishlistDiscountNotifications controller:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send notifications',
      error: error.message
    });
  }
};