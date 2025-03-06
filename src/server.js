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

// defining the port
const PORT = process.env.PORT || 3000;

// if DB is connected, start the server
connectToDatabase().then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}).catch (error => {
    console.log('error connecting: ' + error);
    process.exit(0);
});


