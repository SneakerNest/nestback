import dotenv from 'dotenv';
import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const determineRole = (email) => {
  if (email.includes('@productmanager.com')) return 'productManager';
  if (email.includes('@salesmanager.com')) return 'salesManager';
  return 'customer';
};

const checkRole = async (username) => {
  const [cust] = await pool.query('SELECT * FROM Customer WHERE username = ?', [username]);
  if (cust.length > 0) return 'customer';

  const [pm] = await pool.query('SELECT * FROM ProductManager WHERE username = ?', [username]);
  if (pm.length > 0) return 'productManager';

  const [sm] = await pool.query('SELECT * FROM SalesManager WHERE username = ?', [username]);
  if (sm.length > 0) return 'salesManager';

  return 'unknown';
};

const registerUser = async (req, res) => {
  try {
    const { name, email, username, password, address, phone, taxID } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ msg: 'Please fill in all required fields' });
    }

    const [existingUser] = await pool.query(
      'SELECT * FROM USERS WHERE username = ? OR email = ?',
      [username, email]
    );
    if (existingUser.length > 0) {
      return res.status(409).json({ msg: 'Username or email already exists' });
    }

    await pool.query('START TRANSACTION');

    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      await pool.query(
        'INSERT INTO USERS (name, email, username, password) VALUES (?, ?, ?, ?)',
        [name, email, username, hash]
      );

      const role = determineRole(email);

      if (role === 'productManager') {
        await pool.query(
          'INSERT INTO ProductManager (username, supplierID) VALUES (?, ?)',
          [username, 1]
        );
      } else if (role === 'salesManager') {
        await pool.query(
          'INSERT INTO SalesManager (username, supplierID) VALUES (?, ?)',
          [username, 1]
        );
      } else {
        if (!address || !phone || !taxID) {
          throw new Error('Customer registration requires address, phone, and taxID');
        }

        const {
          addressTitle,
          country,
          city,
          province,
          zipCode,
          streetAddress
        } = address;

        const [addressResult] = await pool.query(
          'INSERT INTO Address (addressTitle, country, city, province, zipCode, streetAddress, longitude, latitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [addressTitle, country, city, province, zipCode, streetAddress, 0, 0]
        );

        const addressID = addressResult.insertId;

        await pool.query(
          'INSERT INTO Customer (username, addressID, phone, taxID) VALUES (?, ?, ?, ?)',
          [username, addressID, phone, taxID]
        );
      }

      await pool.query('COMMIT');

      return res.status(201).json({
        msg: 'User registered successfully',
        role
      });

    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }

  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      msg: 'Error registering user',
      error: err.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Please fill in all fields' });
    }

    const [users] = await pool.query('SELECT * FROM USERS WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.status(401).json({ msg: 'Invalid username or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid username or password' });
    }

    const role = await checkRole(username);

    const token = jwt.sign(
      { id: user.username, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        name: user.name,
        role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ msg: 'Error logging in' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const sql = 'SELECT * FROM Customer WHERE username = ?';
    const [results] = await pool.query(sql, [req.username]);
    if (results.length === 0) throw new Error('User not found');

    const customer = results[0];

    const [results2] = await pool.query('SELECT * FROM Address WHERE addressID = ?', [customer.addressID]);
    const address = results2[0];

    const [results3] = await pool.query('SELECT * FROM `Order` WHERE customerID = ?', [customer.customerID]);
    const [results4] = await pool.query('SELECT * FROM USERS WHERE username = ?', [req.username]);

    const user = results4[0];
    delete user.password;
    delete customer.customerID;

    return res.status(200).json({ customer, address, orders: results3, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error getting user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, password, phone } = req.body;

    if (name) {
      await pool.query('UPDATE USERS SET name = ? WHERE username = ?', [name, req.username]);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await pool.query('UPDATE USERS SET password = ? WHERE username = ?', [hash, req.username]);
    }

    if (req.role === 'customer' && phone) {
      await pool.query('UPDATE Customer SET phone = ? WHERE username = ?', [phone, req.username]);
    }

    return res.status(200).json({ msg: 'User updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM USERS WHERE username = ?', [req.username]);
    return res.status(200).json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error deleting user' });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
};
