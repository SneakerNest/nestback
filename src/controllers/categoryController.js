// Create a new file for category management

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file; // This comes from multer middleware
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    let imageFileName = null;
    
    // Handle image upload if present
    if (image) {
      imageFileName = `category_${Date.now()}_${image.originalname.replace(/\s+/g, '_')}`;
      
      // Create directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '../../public/uploads/categories');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Write file to disk
      const filePath = path.join(uploadsDir, imageFileName);
      fs.writeFileSync(filePath, image.buffer);
    }
    
    const [result] = await pool.query(
      'INSERT INTO Category (name, description, image) VALUES (?, ?, ?)',
      [name, description || null, imageFileName]
    );
    
    const categoryId = result.insertId;
    
    return res.status(201).json({
      categoryID: categoryId,
      name,
      description,
      image: imageFileName,
      message: 'Category created successfully'
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check for existing products in this category
    const [products] = await pool.query('SELECT COUNT(*) as count FROM Product WHERE categoryID = ?', [id]);
    
    if (products[0].count > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category with ${products[0].count} associated products. Please delete or reassign the products first.` 
      });
    }
    
    await pool.query('DELETE FROM Category WHERE categoryID = ?', [id]);
    
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};