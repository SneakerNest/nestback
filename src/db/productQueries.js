// src/db/productQueries.js
import { executeQuery } from './executeQuery.js';

// Get all products
export const getAllProducts = async () => {
  return executeQuery('SELECT * FROM Product');
};

// Get product by ID
export const getProductById = async (id) => {
  const results = await executeQuery('SELECT * FROM Product WHERE id = ?', [id]);
  return results[0] || null;
};

// Create a new product
export const createProduct = async ({ name, model, serialNumber, description, quantityInStock, price, warrantyStatus, distributorInfo }) => {
  const result = await executeQuery(
    'INSERT INTO Product (name, model, serial_number, description, quantity_in_stock, price, warranty_status, distributor) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, model, serialNumber, description, quantityInStock, price, warrantyStatus, distributorInfo]
  );
  return getProductById(result.insertId);
};

// Add product to cart
export const addToCart = async (username, productID, quantity) => {
  await executeQuery(
    'INSERT INTO Cart (username, productID, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?',
    [username, productID, quantity, quantity]
  );
};
