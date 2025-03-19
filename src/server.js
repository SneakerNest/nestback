import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import appRouter from './routes/auth.js';
import { connectToDatabase } from './config/database.js';
import cors from 'cors'; 

const app = express();

// Middleware
app.use(cors());
 // Allow frontend requests
app.use(express.json()); // Parse JSON request bodies

// Routes
app.use('/api/v1/users', appRouter); // Mount the router at /api/v1/users

// Define the port
const PORT = process.env.NODE_DOCKER_PORT||3000;

// Start the server only if the database connection succeeds
connectToDatabase()
    .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to start server due to database connection error:', err.message);
        process.exit(1); // Exit the process if the database connection fails
});