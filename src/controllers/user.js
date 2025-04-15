import dotenv from 'dotenv';
import { pool } from '../config/database.js';
// New (correct, matches your installed package):
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

// Simplified registerUser function
const registerUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ msg: 'Please fill in all fields' });
    }

    // Check existing user
    const [existingUser] = await pool.query('SELECT * FROM USERS WHERE username = ? OR email = ?', [username, email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ msg: 'Username or email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Insert user
    await pool.query(
      'INSERT INTO USERS (name, email, username, password) VALUES (?, ?, ?, ?)', 
      [name, email, username, hash]
    );

    return res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ msg: 'Error registering user' });
  }
};

const registerCustomerInternal = async (req, res) => {
  try {
    const { address, phone, username, taxID } = req.body;

    if (!address || !phone) {
      throw new Error('Please fill in all fields (address, phone)');
    }

    // Insert address into address table
    const { addressTitle, country, city, zipCode, streetAddress } = address;
    const sql = 'INSERT INTO `Address` (addressTitle, country, city, zipCode, streetAddress) VALUES (?, ?, ?, ?, ?)';
    const [results3] = await pool.query(sql, [addressTitle, country, city, zipCode, streetAddress]);
    const addressID = results3.insertId;

    // Insert customer
    const sql2 = 'INSERT INTO `Customer` (username, addressID, phone, taxID) VALUES (?, ?, ?, ?)';
    await pool.query(sql2, [username, addressID, phone, taxID]);

    return true;
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error registering customer' });
  }
};

const registerCustomer = async (req, res) => {
  try {
    // Register user
    await registerUser(req, res);
    // Register Customer
    await registerCustomerInternal(req, res);

    return res.status(200).json({ msg: 'User registered' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error registering user' });
  }
};

const checkRole = async (username) => {
  try {
    console.log(`Checking role for username: ${username}`);

    // Check roles in order
    const sql = 'SELECT * FROM `Customer` WHERE username = ?';
    const [customerResults] = await pool.query(sql, [username]);
    if (customerResults.length > 0) {
      return 'customer';
    }

    const sql2 = 'SELECT * FROM `ProductManager` WHERE username = ?';
    const [productManagerResults] = await pool.query(sql2, [username]);
    if (productManagerResults.length > 0) {
      return 'productManager';
    }

    const sql3 = 'SELECT * FROM `SalesManager` WHERE username = ?';
    const [salesManagerResults] = await pool.query(sql3, [username]);
    if (salesManagerResults.length > 0) {
      return 'salesManager';
    }

    console.log('No specific role found for username:', username);
    return 'admin'; // Default to admin if no other roles match
  } catch (error) {
    console.error('Error in checkRole:', error);
    throw new Error('Failed to determine user role');
  }
};

// Simplified loginUser function
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

    const token = jwt.sign(
      { id: user.username }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    // Fixed cookie settings with proper maxAge value
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000  // 24 hours in milliseconds
    });

    return res.status(200).json({ 
      msg: 'Login successful',
      token,
      user: {
        username: user.username,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ msg: 'Error logging in' });
  }
};

const getUserProfile = async (req, res) => {
  // Get customer profile (this will probably be expanded later)
  try {
    const sql = 'SELECT * FROM `Customer` WHERE username = ?';
    const [results] = await pool.query(sql, [req.username]);
    if (results.length === 0) {
      throw new Error('User not found');
    }

    const customer = results[0];

    const sql2 = 'SELECT * FROM `Address` WHERE addressID = ?';
    const [results2] = await pool.query(sql2, [customer.addressID]);
    const address = results2[0];

    // Add orders here
    const sql3 = 'SELECT * FROM `Order` WHERE customerID = ?';
    const [results3] = await pool.query(sql3, [customer.customerID]);

    // Get user
    // Updated table name from User to USERS
    const sql4 = 'SELECT * FROM USERS WHERE username = ?';
    const [results4] = await pool.query(sql4, [req.username]);

    const user = results4[0];
    // Remove the things that should be removed
    delete user.password;
    delete customer.customerID;

    return res.status(200).json({
      customer: customer,
      address: address,
      orders: results3,
      user: user
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error getting user profile' });
  }
};

const updateUserProfile = async (req, res) => {
  // Allows user to update name, password
  // If the user is a customer, they can also update their phone. Address is up to addressAPI.
  try {
    const { name, password, phone } = req.body;
    
    if (name) {
      // Updated table name from User to USERS
      const sql = 'UPDATE USERS SET name = ? WHERE username = ?';
      await pool.query(sql, [name, req.username]);
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      // Updated table name from User to USERS
      const sql = 'UPDATE USERS SET password = ? WHERE username = ?';
      await pool.query(sql, [hash, req.username]);
    }

    // Customer specific
    if (req.role === 'customer' && phone) {
      const sql = 'UPDATE `Customer` SET phone = ? WHERE username = ?';
      await pool.query(sql, [phone, req.username]);
    }

    return res.status(200).json({
      msg: 'User updated'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error updating user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    // Updated table name from User to USERS
    const sql = 'DELETE FROM USERS WHERE username = ?';
    await pool.query(sql, [req.username]);
    return res.status(200).json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: 'Error deleting user' });
  }
};

// Update exports to match what we're actually using
export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser
};