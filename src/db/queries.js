// src/db/queries.js
import { pool } from '../config/database.js';

// Helper to execute queries safely
const executeQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    return rows;
  } catch (error) {
    console.error(`Query failed: ${error.message}`);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// Get all users
export const getAllUsers = async () => {
  return executeQuery('SELECT * FROM USERS');
};

// Find user by username
export const findByUsername = async (username) => {
  const results = await executeQuery('SELECT * FROM USERS WHERE username = ?', [username]);
  return results[0] || null;
};

// Find user by email with role determination
export const findByEmail = async (email) => {
  const results = await executeQuery('SELECT * FROM USERS WHERE email = ?', [email]);
  const user = results[0] || null;
  
  if (user) {
    user.role = await checkRole(user.username);
  }
  
  return user;
};///?????????????????????????????

// Check user role dynamically
const checkRole = async (username) => {
  const productManagerResults = await executeQuery('SELECT * FROM ProductManager WHERE username = ?', [username]);
  if (productManagerResults.length > 0) {
    return 'product_manager';
  }
  
  const salesManagerResults = await executeQuery('SELECT * FROM SalesManager WHERE username = ?', [username]);
  if (salesManagerResults.length > 0) {
    return 'sales_manager';
  }
  
  return 'user';
};

// Create a new user
export const createUser = async ({ name, username, email, password }) => {
  await executeQuery(
    'INSERT INTO USERS (username, name, email, password) VALUES (?, ?, ?, ?)',
    [username, name, email, password]
  );
  return findByUsername(username); // Return the newly created user
};