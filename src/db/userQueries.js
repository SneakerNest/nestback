import { executeQuery } from './executeQuery.js';

export const getAllUsers = async () => {
  return executeQuery('SELECT * FROM USERS');
};

export const findByUsername = async (username) => {
  const results = await executeQuery('SELECT * FROM USERS WHERE username = ?', [username]);
  return results[0] || null;
};

export const findByEmail = async (email) => {
  const results = await executeQuery('SELECT * FROM USERS WHERE email = ?', [email]);
  const user = results[0] || null;

  if (user) {
    user.role = await checkRole(user.username);
  }

  return user;
};

const checkRole = async (username) => {
  const productManagerResults = await executeQuery('SELECT * FROM ProductManager WHERE username = ?', [username]);
  if (productManagerResults.length > 0) return 'product_manager';

  const salesManagerResults = await executeQuery('SELECT * FROM SalesManager WHERE username = ?', [username]);
  if (salesManagerResults.length > 0) return 'sales_manager';

  return 'user';
};

export const createUser = async ({ name, username, email, password }) => {
  await executeQuery(
    'INSERT INTO USERS (username, name, email, password) VALUES (?, ?, ?, ?)',
    [username, name, email, password]
  );
  return findByUsername(username);
};
