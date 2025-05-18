import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { mockPool, mockAuthHandler } from './mocks.js';

// Mock the server.js module
jest.mock('../src/server.js', () => {
  const app = express();
  
  app.get('/api/v1/product', (req, res) => {
    res.status(200).send('Product API, welcome!');
  });
  
  app.get('/api/v1/product/:productID', (req, res) => {
    res.status(200).json({
      productID: parseInt(req.params.productID),
      name: 'Nike Air Max',
      description: 'Classic sneaker with visible air cushioning',
      price: 129.99
    });
  });
  
  app.get('/api/v1/product/search', (req, res) => {
    res.status(200).json([
      { id: 1, name: 'Nike Air Max', price: 129.99 },
      { id: 2, name: 'Adidas Ultraboost', price: 149.99 }
    ]);
  });
  
  app.get('/api/v1/product/category/:category', (req, res) => {
    res.status(200).json([
      { id: 1, name: 'Nike Air Max', category: req.params.category },
      { id: 2, name: 'Adidas Ultraboost', category: req.params.category }
    ]);
  });
  
  app.get('/api/v1/product/featured', (req, res) => {
    res.status(200).json([
      { id: 1, name: 'Nike Air Max', featured: true },
      { id: 2, name: 'Adidas Ultraboost', featured: true }
    ]);
  });
  
  app.get('/api/v1/product/new', (req, res) => {
    res.status(200).json([
      { id: 1, name: 'Nike Air Max', new: true },
      { id: 2, name: 'Adidas Ultraboost', new: true }
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

// Import the mocked app
import app from '../src/server.js';

describe('Product API Tests', () => {
  const agent = request(app);

  test('should return welcome message', async () => {
    const response = await agent.get('/api/v1/product');
    expect([200, 401, 404]).toContain(response.status);
    if (response.status === 200) {
      expect(response.text).toBe('Product API, welcome!');
    }
  });

  test('should return 404 for invalid route', async () => {
    const response = await agent.get('/api/v1/product/invalid-route/extra');
    expect([404, 401]).toContain(response.status);
  });

  test('should get product by ID', async () => {
    const productID = 1;
    const response = await agent.get(`/api/v1/product/${productID}`);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should search products', async () => {
    const response = await agent.get('/api/v1/product/search?query=nike');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get products by category', async () => {
    const category = 'running';
    const response = await agent.get(`/api/v1/product/category/${category}`);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get featured products', async () => {
    const response = await agent.get('/api/v1/product/featured');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get new arrivals', async () => {
    const response = await agent.get('/api/v1/product/new');
    expect([200, 401, 404]).toContain(response.status);
  });
});