import { findByEmail, findByUsername, createUser } from '../db/queries.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'; // Fallback for safety

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Generate JWT token
// ??????????????????
const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, email: user.email, role: user.role }, 
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const registerUser = async ({ name, username, email, password }) => {
  const existingUser = await findByUsername(username);
  if (existingUser) throw new Error('Username already taken');

  const existingEmail = await findByEmail(email);
  if (existingEmail) throw new Error('Email already in use');

  const hashedPassword = await hashPassword(password);
  const newUser = await createUser({ name, username, email, password: hashedPassword });
  
  // Fetch the full user object with role (or set a default role)
  const fullUser = await findByUsername(username); // This will include role via checkRole
  return { ...fullUser, token: generateToken(fullUser) };
};

export const loginUser = async ({ email, password }) => {
  const user = await findByEmail(email); // Fetch user by email and determine their role
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid email or password');
  }
  return { ...user, token: generateToken(user) }; // user.role is included here
};