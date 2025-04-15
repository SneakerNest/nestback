import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import userRouter from './routes/UserAPI.js'; // ✅ renamed for clarity
import { connectToDatabase } from './config/database.js';
import cartRouter from './routes/cart.js';
import storeRouter from './routes/Store.js';
import wishlistRouter from './routes/wishlist.js';
import addressRouter from './routes/AddressAPI.js';
import billingRouter from './routes/billing.js';
import orderRouter from './routes/order.js';
import cors from 'cors'; 
import cookieParser from 'cookie-parser';

const app = express();
console.log('NODE_DOCKER_PORT:', process.env.NODE_DOCKER_PORT);

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(cookieParser()); 

// Routes
app.use('/api/v1/users', userRouter); // ✅ matches imported name
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/wishlist', wishlistRouter); 
app.use('/api/v1/store', storeRouter);
app.use('/api/v1/address', addressRouter);
app.use('/api/v1/billing', billingRouter);
app.use('/api/v1/order', orderRouter);

// Health check
app.get('/', (req, res) => {
  res.send('Server is running and working fine!');
});

// Server startup
connectToDatabase()
  .then(() => {
    app.listen(process.env.NODE_DOCKER_PORT || 3000, '0.0.0.0', () => {
      console.log(`Server running on port ${process.env.NODE_DOCKER_PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server due to database connection error:', err.message);
    process.exit(1);
  });
