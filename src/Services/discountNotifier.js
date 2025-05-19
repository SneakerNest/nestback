import { transporter } from './mailTransporter.js';
import { pool } from '../config/database.js';

/**
 * Sends email notifications to customers who have a product in their wishlist when it gets discounted
 */
export const sendDiscountNotifications = async (productID, discountPercentage, unitPrice) => {
  try {
    console.log(`Starting discount notification process for product ID: ${productID}, discount: ${discountPercentage}%, price: $${unitPrice}`);
    
    const connection = await pool.getConnection();
    
    try {
      // Get product details
      const [productResult] = await connection.query(
        'SELECT name, productID FROM Product WHERE productID = ?',
        [productID]
      );
      
      if (productResult.length === 0) {
        console.error(`Product with ID ${productID} not found`);
        return { success: false, message: 'Product not found' };
      }
      
      const product = productResult[0];
      console.log(`Found product for discount notification: ${product.name} (ID: ${product.productID})`);
      
      // First check if the product is in any wishlist at all
      const [wishlistCheck] = await connection.query(
        'SELECT COUNT(*) as count FROM WishlistItems WHERE productID = ?',
        [productID]
      );
      
      console.log(`Product is in ${wishlistCheck[0].count} wishlists`);
      
      if (wishlistCheck[0].count === 0) {
        return { success: true, sent: 0, message: 'Product not in any wishlist' };
      }
      
      // Find customers who have this product in their wishlist
      const [customers] = await connection.query(`
        SELECT DISTINCT c.customerID, u.email, u.name
        FROM WishlistItems wi
        JOIN Wishlist w ON wi.wishlistID = w.wishlistID
        JOIN Customer c ON w.customerID = c.customerID
        JOIN USERS u ON c.username = u.username
        WHERE wi.productID = ? AND u.email IS NOT NULL
      `, [productID]);
      
      console.log(`Found ${customers.length} customers with product ${product.name} in wishlist`);
      console.log(`Customer emails: ${customers.map(c => c.email).join(', ')}`);
      
      if (customers.length === 0) {
        return { success: true, sent: 0, message: 'No customers with email to notify' };
      }
      
      // Format image name according to convention
      const imageFileName = product.name.replace(/\s+/g, '_').toLowerCase() + '.jpg';
      
      // Calculate discounted price
      const discountedPrice = (unitPrice * (1 - discountPercentage / 100)).toFixed(2);
      
      // Send emails
      let sentCount = 0;
      
      for (const customer of customers) {
        try {
          if (!customer.email) {
            console.log(`Skipping notification for customer ${customer.customerID}: No email address`);
            continue;
          }
          
          console.log(`Sending discount notification to: ${customer.email} for product: ${product.name}`);
          
          // Construct the email
          const mailOptions = {
            from: 'sneakernest1@gmail.com',
            to: customer.email,
            subject: `Special Discount on ${product.name}!`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <img src="https://i.imgur.com/McnVCMF.jpg" alt="SneakerNest" style="max-width: 150px;">
                </div>
                
                <h2 style="color: #ff4a4a; text-align: center;">Special Discount Alert!</h2>
                
                <p style="font-size: 16px;">Hello ${customer.name},</p>
                <p style="font-size: 16px;">Good news! A product in your wishlist is now on sale:</p>
                
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <div style="display: flex; align-items: center;">
                    <img src="http://localhost:5001/api/v1/images/${imageFileName}" 
                         alt="${product.name}" 
                         style="width: 100px; height: 100px; object-fit: contain; margin-right: 20px;">
                    <div>
                      <h3 style="margin-top: 0; color: #333;">${product.name}</h3>
                      <p style="color: #888; text-decoration: line-through;">Original Price: $${unitPrice}</p>
                      <p style="color: #ff4a4a; font-weight: bold; font-size: 20px;">
                        Now: $${discountedPrice} (${discountPercentage}% OFF)
                      </p>
                    </div>
                  </div>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:3000/product/${productID}" 
                     style="display: inline-block; background-color: #ff4a4a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                    View Product
                  </a>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="http://localhost:3000/wishlist" 
                     style="display: inline-block; background-color: #333; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                    Go to My Wishlist
                  </a>
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
          console.log(`Email sent successfully to ${customer.email}, messageId: ${result.messageId}`);
          sentCount++;
        } catch (emailError) {
          console.error(`Error sending email to ${customer.email}:`, emailError);
        }
      }
      
      return { 
        success: true, 
        sent: sentCount, 
        message: `Sent ${sentCount} discount notifications` 
      };
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in sendDiscountNotifications:', error);
    return { success: false, message: error.message };
  }
};