import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import appRouter from './routes/auth.js';
import { connectToDatabase } from '../src/config/database.js';

// Create Express app
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies (replaces body-parser)

// Routes
app.use('/api/v1/users', appRouter); // Mount the router at /api/v1/users

// Define the port
const PORT = process.env.PORT || 5000;

// Start the server only if the database connection succeeds
connectToDatabase()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to start server due to database connection error:', err);
        process.exit(1); // Exit the process if the database connection fails
});