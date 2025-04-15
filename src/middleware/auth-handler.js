import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const token = req.cookies.authToken; // Retrieve token from cookies

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    // Attach the decoded token payload to req
    req.username = user.id;
    req.role = user.role;

    next();
  });
};

// Middleware to check user role
const authenticateRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!requiredRoles.includes(req.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

export {
  authenticateToken,
  authenticateRole
};