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

// Find user by email
export const findByEmail = async (email) => {
  const results = await executeQuery('SELECT * FROM USERS WHERE email = ?', [email]);
  return results[0] || null;
};

// Create a new user
export const createUser = async ({ name, username, email, password }) => {
  await executeQuery(
    'INSERT INTO USERS (name, username, email, password) VALUES (?, ?, ?, ?)',
    [name, username, email, password]
  );
  return findByUsername(username); // Return the newly created user
};