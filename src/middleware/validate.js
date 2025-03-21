import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// Registration validation rules
export const validateRegistration = [
  body('name').notEmpty().withMessage('Name is required'),
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(403).json({ message: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};


// Middleware to verify if the user is a sales manager
export const isSalesManager = (req, res, next) => {
  if (req.user.role !== 'sales_manager') {
    return res.status(403).json({ message: 'Access denied. You must be a sales manager.' });
  }
  next();
};

// Middleware to verify if the user is a product manager
export const isProductManager = (req, res, next) => {
  if (req.user.role !== 'product_manager') {
    return res.status(403).json({ message: 'Access denied. You must be a product manager.' });
  }
  next();
};
