import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import userRouter from './routes/UserAPI.js'; 
import { connectToDatabase } from './config/database.js';
import cartRouter from './routes/CartAPI.js';
import storeRouter from './routes/StoreAPI.js';
import wishlistRouter from './routes/WishlistAPI.js';
import addressRouter from './routes/AddressAPI.js';
import orderRouter from './routes/OrderAPI.js';
import paymentRouter from './routes/PaymentAPI.js';
import deliveryRouter from './routes/DeliveryAPI.js';
import invoiceRouter from './routes/InvoiceAPI.js';
import imagesRouter from './routes/ImagesAPI.js';
import reviewsRouter from './routes/ReviewsAPI.js';
import productManagerRouter from './routes/ProductManagerAPI.js';
import salesManagerRouter from './routes/SalesManagerAPI.js';
import cors from 'cors'; 
import cookieParser from 'cookie-parser';

const app = express();
console.log('NODE_DOCKER_PORT:', process.env.NODE_DOCKER_PORT);

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001'], // Allow both frontend and API URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/store', storeRouter);
app.use('/api/v1/wishlist', wishlistRouter);
app.use('/api/v1/address', addressRouter);
app.use('/api/v1/order', orderRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/delivery', deliveryRouter);
app.use('/api/v1/invoice', invoiceRouter);
app.use('/api/v1/images', imagesRouter);
app.use('/api/v1/reviews', reviewsRouter);
app.use('/api/v1/product-manager', productManagerRouter);
app.use('/api/v1/sales-manager', salesManagerRouter);

// Health check
app.get('/', (req, res) => {
  res.send('Server is running and working fine!');
});

// Server startup
if (process.env.NODE_ENV !== 'test') {
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
}

export default app;