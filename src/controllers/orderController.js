import { pool } from '../config/database.js';

// Get all products with categories
export const getProductsByCategory = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.categoryID,
                c.name as categoryName,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'productID', p.productID,
                        'name', p.name,
                        'description', p.description,
                        'unitPrice', p.unitPrice,
                        'discountPercentage', p.discountPercentage,
                        'stock', p.stock,
                        'brand', p.brand,
                        'color', p.color,
                        'pictures', (
                            SELECT GROUP_CONCAT(picturePath)
                            FROM Pictures
                            WHERE productID = p.productID
                        )
                    )
                ) as products
            FROM Category c
            LEFT JOIN CategoryCategorizesProduct ccp ON c.categoryID = ccp.categoryID
            LEFT JOIN Product p ON ccp.productID = p.productID
            WHERE c.parentCategoryID = 0
            GROUP BY c.categoryID
        `;

        const [results] = await pool.query(query);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
};

// Place order
export const placeOrder = async (req, res) => {
    try {
        const { cart, address } = req.body;

        // Check if user is logged in
        if (!cart.loggedIn || cart.temporary || !cart.customerID) {
            return res.status(401).json({
                message: 'Please login to place an order',
                cartDetails: cart
            });
        }

        await pool.query('START TRANSACTION');

        // Insert delivery address
        const addressQuery = `
            INSERT INTO Address (addressTitle, country, city, province, zipCode, streetAddress) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [addressResult] = await pool.query(addressQuery, [
            'Delivery Address',
            address.country,
            address.city,
            address.province,
            address.zipCode,
            address.streetAddress
        ]);

        const addressID = addressResult.insertId;

        // Process each product in cart
        for (const product of cart.products) {
            // Check stock availability
            const [stockCheck] = await pool.query(
                'SELECT stock FROM Product WHERE productID = ? FOR UPDATE',
                [product.productID]
            );

            if (!stockCheck[0] || stockCheck[0].stock < product.quantity) {
                await pool.query('ROLLBACK');
                return res.status(400).json({
                    message: `Insufficient stock for product: ${product.name}`
                });
            }

            // Update stock
            await pool.query(
                'UPDATE Product SET stock = stock - ? WHERE productID = ?',
                [product.quantity, product.productID]
            );
        }

        // Clear the cart
        await pool.query('DELETE FROM Cart WHERE cartID = ?', [cart.cartID]);

        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Order placed successfully',
            orderDetails: {
                customerID: cart.customerID,
                totalAmount: cart.totalPrice,
                numberOfItems: cart.numProducts,
                deliveryAddress: addressID,
                products: cart.products.map(p => ({
                    productID: p.productID,
                    name: p.name,
                    quantity: p.quantity,
                    unitPrice: p.unitPrice,
                    discountedPrice: p.discountedPrice
                }))
            }
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error placing order:', error);
        res.status(500).json({
            message: 'Error placing order',
            error: error.message
        });
    }
};