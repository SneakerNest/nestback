export const verifyRole = (roles) => (req, res, next) => {
    const { role } = req.user;
    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };