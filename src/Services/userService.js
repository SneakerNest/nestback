import { findByEmail, findByUsername, createUser } from '../db/queries.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'; // Fallback for safety

const getRoleByEmail = (email) => {
  if (email === 'sales_manager@example.com') return 'sales_manager';
  if (email === 'product_manager@example.com') return 'product_manager';
  return 'user';
};
// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ username: user.username, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
};

export const registerUser = async ({ name, username, email, password }) => {
  const existingUser = await findByUsername(username);
  if (existingUser) throw new Error('Username already taken');

  const existingEmail = await findByEmail(email);
  if (existingEmail) throw new Error('Email already in use');

  const hashedPassword = await hashPassword(password);
  const role = getRoleByEmail(email);
  const newUser = await createUser({ name, username, email, password: hashedPassword, role });
  return { ...newUser, token: generateToken( ...newUser, role) };
};

export const loginUser = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid email or password');
  }
  const role = getRoleByEmail(email);
  return { ...user, role, token: generateToken({ ...user, role}) };
};