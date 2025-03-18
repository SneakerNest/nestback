import { registerUser, loginUser } from "../services/userService.js";
import { getAllUsers } from "../db/queries.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      message: 'User registered successfully',
      user: { username: user.username, name: user.name, email: user.email },
      token: user.token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const user = await loginUser(req.body);
    res.json({
      message: 'Login successful',
      user: { username: user.username, name: user.name, email: user.email },
      token: user.token,
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};