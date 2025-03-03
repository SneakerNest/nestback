const express = require('express');
const router = express.Router();
const { register,login } = require('../controllers/authController');
const { validateRegistration } = require('../middleware/validate');

router.post('/login', login); 
router.post('/register', validateRegistration, register);

module.exports = router;