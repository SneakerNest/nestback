import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter for nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sneakernest1@gmail.com', // Your SneakerNest email
        pass: process.env.MAIL_PASSWORD, // App-specific password from Gmail
    },
});

export { transporter };