import { findByEmail, findByUsername, createUser } from '../db/userQueries.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../db/executeQuery.js';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'; // Fallback for safety

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      username: user.username,
      email: user.email,
      role: user.role,
      customerID: user.customerID || null  // include if available
    },
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

  const fullUser = await findByUsername(username);
  return { ...fullUser, token: generateToken(fullUser) };
};

const loginUser = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid email or password');
  }

  // Get customerID if this user is a customer
  const customer = await executeQuery(
    'SELECT customerID FROM Customer WHERE username = ?',
    [user.username]
  );

  const customerID = customer[0]?.customerID || null;

  return {
    ...user,
    customerID,
    token: generateToken({ ...user, customerID })
  };
};
export { loginUser };