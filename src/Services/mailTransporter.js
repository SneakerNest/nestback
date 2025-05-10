import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter for nodemailer
// const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     secure: false, // true for 465, false for other ports
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS
//     }
// };

// Verify SMTP connection configuration
// transporter.verify(function(error, success) {
//     if (error) {
//         console.log('SMTP connection error:', error);
//     } else {
//         console.log('SMTP server is ready to send emails');
//     }
// });

// export { transporter };