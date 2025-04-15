import dotenv from 'dotenv';
dotenv.config();
import { pool } from '../config/database.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    if (!name || !email || !username || !password) {
      throw new Error('Please fill in all fields');
    }

    const [results] = await pool.query('SELECT * FROM USERS WHERE username = ?', [username]);
    if (results.length > 0) return;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    await pool.query('INSERT INTO USERS (name, email, username, password) VALUES (?, ?, ?, ?)', [name, email, username, hash]);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const registerCustomerInternal = async (req, res) => {
  try {
    const { address, phone, username, taxID } = req.body;
    if (!address || !phone) throw new Error('Please fill in all fields (address, phone)');

    const { addressTitle, country, city, zipCode, streetAddress } = address;
    const [results3] = await pool.query(
      'INSERT INTO Address (addressTitle, country, city, zipCode, streetAddress) VALUES (?, ?, ?, ?, ?)',
      [addressTitle, country, city, zipCode, streetAddress]
    );
    const addressID = results3.insertId;

    await pool.query('INSERT INTO Customer (username, addressID, phone, taxID) VALUES (?, ?, ?, ?)', [username, addressID, phone, taxID]);
    return true;
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error registering customer' });
  }
};

const registerCustomer = async (req, res) => {
  try {
    await registerUser(req, res);
    await registerCustomerInternal(req, res);
    return res.status(200).json({ msg: 'User registered' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Error registering user' });
  }
};

const checkRole = async (username) => {
  try {
    console.log(`Checking role for username: ${username}`);
    const [customerResults] = await pool.query('SELECT * FROM Customer WHERE username = ?', [username]);
    if (customerResults.length > 0) return 'customer';

    const [productManagerResults] = await pool.query('SELECT * FROM ProductManager WHERE username = ?', [username]);
    if (productManagerResults.length > 0) return 'productManager';

    const [salesManagerResults] = await pool.query('SELECT * FROM SalesManager WHERE username = ?', [username]);
    if (salesManagerResults.length > 0) return 'salesManager';

    console.log('No specific role found for username:', username);
    return 'admin';
  } catch (error) {
    console.error('Error in checkRole:', error);
    throw new Error('Failed to determine user role');
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ msg: 'Please fill in all fields' });

    const [userResults] = await pool.query('SELECT * FROM USERS WHERE username = ?', [username]);
    if (userResults.length === 0) return res.status(401).json({ msg: 'Invalid username or password' });

    const user = userResults[0];
    let customerID = null;
    let role = 'customer';

    const [customerResults] = await pool.query('SELECT customerID FROM Customer WHERE username = ?', [username]);
    if (customerResults.length > 0) {
      customerID = customerResults[0].customerID;
    } else {
      const [productManagerResults] = await pool.query('SELECT * FROM ProductManager WHERE username = ?', [username]);
      if (productManagerResults.length > 0) {
        role = 'productManager';
      } else {
        const [salesManagerResults] = await pool.query('SELECT * FROM SalesManager WHERE username = ?', [username]);
        if (salesManagerResults.length > 0) {
          role = 'salesManager';
        } else {
          return res.status(404).json({ msg: 'User not found' });
        }
      }
    }

    console.log(`Role for user ${username}: ${role}`);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid username or password' });

    const token = jwt.sign({ id: user.username, role, customerID }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    res.cookie('authToken', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: parseInt(process.env.JWT_COOKIE),
    });

    return res.status(200).json({ msg: 'User logged in', token, role });
  } catch (error) {
    console.error('Error in loginUser:', error);
    return res.status(500).json({ msg: 'Error logging in' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM Customer WHERE username = ?', [req.username]);
    if (results.length == 0) throw new Error('User not found');

    const customer = results[0];
    const [addressResult] = await pool.query('SELECT * FROM Address WHERE addressID = ?', [customer.addressID]);
    const address = addressResult[0];
    const [orders] = await pool.query('SELECT * FROM `Order` WHERE customerID = ?', [customer.customerID]);
    const [userResult] = await pool.query('SELECT * FROM USERS WHERE username = ?', [req.username]);
    const user = userResult[0];

    delete user.password;
    delete customer.customerID;

    return res.status(200).json({ customer, address, orders, user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error getting user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { name, password, phone } = req.body;
    if (name) await pool.query('UPDATE USERS SET name = ? WHERE username = ?', [name, req.username]);
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
    console.log(err);
    return res.status(500).json({ msg: 'Error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM USERS WHERE username = ?', [req.username]);
    return res.status(200).json({ msg: 'User deleted' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Error deleting user' });
  }
};

export {
  registerCustomer,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
};