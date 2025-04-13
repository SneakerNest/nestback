import { pool } from '../config/dbConfig.js';

export const executeQuery = async (query, params = []) => {
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
