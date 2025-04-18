import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER || 'sneakernest@store.com', // Use env, fallback default
    pass: process.env.MAIL_PASSWORD, // App password
  },
});

export { transporter };