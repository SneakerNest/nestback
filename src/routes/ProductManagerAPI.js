import { Router } from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

const router = Router();

// Add a new product (pending until sales manager approves)
router.post('/products', authenticateToken, authenticateRole(['productManager']), async (req, res) => {
    try {
        const {
            name, stock, description, brand, color, material,
            warrantyMonths, serialNumber, supplierID, categories
        } = req.body;

        // Validate required fields
        if (!name || !stock || !description || !brand || !color || !material || 
            !warrantyMonths || !serialNumber || !supplierID || !categories) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['name', 'stock', 'description', 'brand', 'color', 'material', 
                          'warrantyMonths', 'serialNumber', 'supplierID', 'categories']
            });
        }

        // Validate categories array
        if (!Array.isArray(categories) || categories.length === 0) {
            return res.status(400).json({
                message: 'Categories must be a non-empty array of category IDs'
            });
        }

        // Verify supplierID matches product manager's supplier
        const [productManager] = await pool.query(
            'SELECT supplierID FROM ProductManager WHERE username = ?',
            [req.username]
        );

        if (!productManager.length || productManager[0].supplierID !== supplierID) {
            return res.status(403).json({ 
                message: 'You can only add products for your assigned supplier' 
            });
        }

        // Verify that all categories exist
        const [existingCategories] = await pool.query(
            'SELECT categoryID FROM Category WHERE categoryID IN (?)',
            [categories]
        );

        if (existingCategories.length !== categories.length) {
            return res.status(400).json({
                message: 'One or more category IDs do not exist',
                validCategories: existingCategories.map(c => c.categoryID)
            });
        }

        // Start transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Insert product with pending status
            const [result] = await connection.query(
                `INSERT INTO Product (name, stock, unitPrice, description, brand, color, 
                material, warrantyMonths, serialNumber, supplierID, status)
                VALUES (?, ?, 0.00, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                [name, stock, description, brand, color, material, warrantyMonths, serialNumber, supplierID]
            );

            const productId = result.insertId;

            // Add categories
            const categoryValues = categories.map(categoryId => [categoryId, productId]);
            await connection.query(
                'INSERT INTO CategoryCategorizesProduct (categoryID, productID) VALUES ?',
                [categoryValues]
            );

            await connection.commit();
            res.status(201).json({ 
                message: 'Product added successfully', 
                productId,
                status: 'pending'
            });
        } catch (error) {
            await connection.rollback();
            console.error('Database error:', error);
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ 
            message: 'Error adding product',
            error: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage
        });
    }
});

// Get all invoices with addresses
router.get('/invoices', authenticateToken, async (req, res) => {
    try {
        const [invoices] = await pool.query(`
            SELECT 
                o.orderID,
                o.orderNumber,
                o.timeOrdered,
                o.totalPrice,
                a.addressTitle,
                a.country,
                a.city,
                a.province,
                a.zipCode,
                a.streetAddress,
                c.name as customerName,
                c.email as customerEmail
            FROM \`Order\` o
            JOIN Address a ON o.deliveryAddressID = a.addressID
            JOIN Customer cu ON o.customerID = cu.customerID
            JOIN USERS c ON cu.username = c.username
            ORDER BY o.timeOrdered DESC
        `);

        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ message: 'Error fetching invoices' });
    }
});

// Add a new category
router.post('/categories', authenticateToken, async (req, res) => {
    try {
        const { name, description, parentCategoryID, image } = req.body;

        const [result] = await pool.query(
            'INSERT INTO Category (name, description, parentCategoryID, image) VALUES (?, ?, ?, ?)',
            [name, description, parentCategoryID || 0, image]
        );

        res.status(201).json({ message: 'Category added successfully', categoryId: result.insertId });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ message: 'Error adding category' });
    }
});

// Remove a category
router.delete('/categories/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM Category WHERE categoryID = ?', [id]);
        res.json({ message: 'Category removed successfully' });
    } catch (error) {
        console.error('Error removing category:', error);
        res.status(500).json({ message: 'Error removing category' });
    }
});

export default router; 