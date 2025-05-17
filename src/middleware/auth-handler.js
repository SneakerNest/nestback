import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  // Check both cookie and Authorization header
  const tokenFromCookie = req.cookies.authToken;
  const tokenFromHeader = req.headers.authorization?.split(' ')[1];
  const token = tokenFromCookie || tokenFromHeader;

  console.log('Auth check - Cookie token:', !!tokenFromCookie, 'Header token:', !!tokenFromHeader);

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
    req.user = {
      username: user.id,
      role: user.role
    };

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