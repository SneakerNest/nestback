const { body, validationResult } = require('express-validator'); 

const validateRegistration = [
    (req, res, next) => {
      console.log('Request body:', req.body); // Log what’s received
      next();
    },
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ];

module.exports = { validateRegistration };