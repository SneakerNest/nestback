import { find, create } from '../../DB/queries.js';
import { registerUser, loginUser } from '../Services/userService.js';

// Register User
export const register = async (req, res) => {
  try {
      const { name, username, email, password } = req.body;
      const user = await registerUser({ name, username, email, password });
      res.status(201).json({
          message: 'User registered successfully',
          user: { name: user.name, username: user.username, email: user.email },
      });
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
};

// Login User
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await loginUser({ email, password });
        res.json({ message: 'Login successful', user });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await find();
        return res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ error });
    }
};

