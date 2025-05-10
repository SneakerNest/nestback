import { Router } from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, authenticateRole } from '../middleware/auth-handler.js';

const router = Router();

// Get all pending products
router.get('/pending-products', authenticateToken, authenticateRole(['salesManager']), async (req, res) => {
    try {
        const [products] = await pool.query(`
            SELECT p.*, GROUP_CONCAT(c.name) as categories
            FROM Product p
            LEFT JOIN CategoryCategorizesProduct ccp ON p.productID = ccp.productID
            LEFT JOIN Category c ON ccp.categoryID = c.categoryID
            WHERE p.status = 'pending'
            GROUP BY p.productID
        `);
        res.json(products);
    } catch (error) {
        console.error('Error fetching pending products:', error);
        res.status(500).json({ message: 'Error fetching pending products' });
    }
});

// Set product price and approve product
router.put('/products/:id/price', authenticateToken, authenticateRole(['salesManager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { unitPrice } = req.body;

        if (!unitPrice || unitPrice <= 0) {
            return res.status(400).json({ message: 'Invalid price' });
        }

        await pool.query(
            'UPDATE Product SET unitPrice = ?, status = "approved" WHERE productID = ?',
            [unitPrice, id]
        );

        res.json({ message: 'Product price set and approved successfully' });
    } catch (error) {
        console.error('Error setting product price:', error);
        res.status(500).json({ message: 'Error setting product price' });
    }
});

// Set product discount
router.put('/products/:id/discount', authenticateToken, authenticateRole(['salesManager']), async (req, res) => {
    try {
        const { id } = req.params;
        const { discountPercentage } = req.body;

        if (discountPercentage < 0 || discountPercentage > 100) {
            return res.status(400).json({ message: 'Invalid discount percentage' });
        }

        await pool.query(
            'UPDATE Product SET discountPercentage = ? WHERE productID = ?',
            [discountPercentage, id]
        );

        res.json({ message: 'Product discount set successfully' });
    } catch (error) {
        console.error('Error setting product discount:', error);
        res.status(500).json({ message: 'Error setting product discount' });
    }
});

// Reject a product
router.put('/products/:id/reject', authenticateToken, authenticateRole(['salesManager']), async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            'UPDATE Product SET status = "rejected" WHERE productID = ?',
            [id]
        );
        res.json({ message: 'Product rejected successfully' });
    } catch (error) {
        console.error('Error rejecting product:', error);
        res.status(500).json({ message: 'Error rejecting product' });
    }
});

export default router; 