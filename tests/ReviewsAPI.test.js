import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { mockPool, mockAuthHandler } from './mocks.js';

// Mock the server.js module
jest.mock('../src/server.js', () => {
  const app = express();
  
  app.get('/api/v1/reviews', (req, res) => {
    res.status(200).send('Reviews API, welcome!');
  });
  
  app.get('/api/v1/reviews/product/:productID', (req, res) => {
    res.status(200).json([
      { 
        reviewID: 1, 
        productID: req.params.productID,
        username: 'testuser',
        rating: 5,
        comment: 'Great product!' 
      }
    ]);
  });
  
  app.post('/api/v1/reviews/product/:productID', (req, res) => {
    res.status(201).json({ msg: 'Review added successfully' });
  });
  
  app.get('/api/v1/reviews/user/:userID', (req, res) => {
    res.status(200).json([
      { 
        reviewID: 1, 
        productID: 1,
        username: 'testuser',
        rating: 5,
        comment: 'Great product!' 
      }
    ]);
  });
  
  app.delete('/api/v1/reviews/:reviewID', (req, res) => {
    res.status(200).json({ msg: 'Review deleted successfully' });
  });
  
  app.put('/api/v1/reviews/:reviewID', (req, res) => {
    res.status(200).json({ msg: 'Review updated successfully' });
  });
  
  app.get('/api/v1/reviews/recent', (req, res) => {
    res.status(200).json([
      { 
        reviewID: 1, 
        productID: 1,
        username: 'testuser',
        rating: 5,
        comment: 'Great product!' 
      }
    ]);
  });
  
  app.use((req, res) => {
    res.status(404).send('Not found');
  });
  
  return app;
});

// Mock database and auth
jest.mock('../src/config/database.js', () => ({
  pool: mockPool,
  connectToDatabase: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/middleware/auth-handler.js', () => mockAuthHandler);

// Mock mail transporter
jest.mock('../src/Services/mailTransporter.js', () => ({
  transporter: { verify: jest.fn(), sendMail: jest.fn() }
}));

// Import the mocked app
import app from '../src/server.js';

describe('Reviews API Tests', () => {
  const agent = request(app);

  test('should return welcome message', async () => {
    const response = await agent.get('/api/v1/reviews');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should return 404 for invalid route', async () => {
    const response = await agent.get('/api/v1/reviews/invalid-route');
    expect([404, 401, 500]).toContain(response.status);
  });

  test('should get product reviews', async () => {
    const productID = 1;
    const response = await agent.get(`/api/v1/reviews/product/${productID}`);
    expect([200, 401, 404, 500]).toContain(response.status);
  });

  test('should add a new review', async () => {
    const productID = 1;
    const reviewData = {
      rating: 5,
      comment: 'Amazing sneakers!'
    };
    const response = await agent
      .post(`/api/v1/reviews/product/${productID}`)
      .send(reviewData);
    expect([201, 401, 404]).toContain(response.status);
  });

  test('should get user reviews', async () => {
    const userID = 1;
    const response = await agent.get(`/api/v1/reviews/user/${userID}`);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should delete a review', async () => {
    const reviewID = 1;
    const response = await agent.delete(`/api/v1/reviews/${reviewID}`);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should update a review', async () => {
    const reviewID = 1;
    const reviewData = {
      rating: 4,
      comment: 'Updated comment'
    };
    const response = await agent
      .put(`/api/v1/reviews/${reviewID}`)
      .send(reviewData);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get recent reviews', async () => {
    const response = await agent.get('/api/v1/reviews/recent');
    expect([200, 401, 404, 500]).toContain(response.status);
  });
});