// importing modules
import express from 'express';
import appRouter from './routes/index.js';
import bodyParser from 'body-parser';
import { config } from 'dotenv';
import "../DB/index.js";
import { connectToDatabase } from '../DB/index.js';
config();
// creating an express app

const app = express();
app.use(bodyParser.json());
app.use("/api/v1/users", appRouter); 

// Add root route handler
app.get('/', (req, res) => {
    res.send('luv u ');
});

// defining the port
const PORT = process.env.NODE_DOCKER_PORT || 8080;

// if DB is connected, start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});