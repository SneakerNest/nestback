const nodemailer = require('nodemailer');
require('dotenv').config();

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: 'zadados308@gmail.com', // Your email
        pass: process.env.MAIL_PASSWORD, // Your email password or app-specific password
    },
});

module.exports = { transporter };