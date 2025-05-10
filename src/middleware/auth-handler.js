import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  console.log('Auth headers:', req.headers);
  
  // Check for token in Authorization header first
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Attach the decoded token payload to req
    req.username = decoded.id;
    req.role = decoded.role;
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ message: 'Invalid token.' });
  }
};

// Middleware to check user role
const authenticateRole = (requiredRoles) => {
  return (req, res, next) => {
    console.log('Checking role. Required:', requiredRoles, 'User role:', req.role);
    
    if (!req.role || !requiredRoles.includes(req.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

export {
  authenticateToken,
  authenticateRole
};