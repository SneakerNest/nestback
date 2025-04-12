import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import appRouter from './routes/auth.js';
import { connectToDatabase } from './config/database.js';
import cartRouter from './routes/cart.js';
import cors from 'cors'; 
import cookieParser from 'cookie-parser';

const app = express();
console.log('NODE_DOCKER_PORT:', process.env.NODE_DOCKER_PORT);
// Middleware
app.use(cors());
 // Allow frontend requests
app.use(express.json()); 

app.use(cookieParser()); 

// Routes
app.use('/api/v1/users', appRouter); 
app.use('/api/v1/cart', cartRouter);

// Define the port
const PORT = process.env.NODE_DOCKER_PORT||3000;

// General Health check route for the entire app
app.get('/', (req, res) => {
    res.send('Server is running and working fine!');
  });

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