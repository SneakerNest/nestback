import { body, validationResult } from 'express-validator';

// Validate product creation
export const validateProductCreation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('model').notEmpty().withMessage('Product model is required'),
  body('serialNumber').notEmpty().withMessage('Serial number is required'),
  body('quantityInStock').isInt({ min: 0 }).withMessage('Quantity in stock must be a non-negative integer'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('warrantyStatus').notEmpty().withMessage('Warranty status is required'),
  body('distributorInfo').notEmpty().withMessage('Distributor information is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// Validate cart addition
export const validateCartAddition = [
  body('productID').isInt().withMessage('Product ID must be an integer'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];
