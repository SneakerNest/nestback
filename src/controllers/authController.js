const { registerUser, loginUser } = require('../Services/userService');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser({ username, email, password });
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser({ email, password });
    res.json({ message: 'Login successful', user });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

module.exports = { register, login }; 