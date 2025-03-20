import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { findByUsername } from '../db/queries.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

// Registration validation rules
export const validateRegistration = [
  body('name').notEmpty().withMessage('Name is required'),
  body('username')
  .notEmpty().withMessage('Username is required')
  .custom(async (value) => {
    const user = await findByUsername(value);
    if (user) {
      throw new Error('Username already exists');
    }
  }),
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
  const authHeader = req.headers['authorization']; // Bearer <token>
  if (!authHeader) return res.status(403).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(403).json({ message: 'No token provided' });
  
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};