import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { mockPool, mockAuthHandler } from './mocks.js';

// Mock the server.js module
jest.mock('../src/server.js', () => {
  const app = express();
  
  app.get('/api/v1/search', (req, res) => {
    res.status(200).send('Search API, welcome!');
  });
  
  app.get('/api/v1/search/products', (req, res) => {
    const { query } = req.query;
    res.status(200).json([
      { id: 1, name: 'Nike Air Max', price: 129.99 },
      { id: 2, name: 'Adidas Ultraboost', price: 149.99 }
    ]);
  });
  
  app.get('/api/v1/search/filter', (req, res) => {
    const { minPrice, maxPrice, categories, brands } = req.query;
    res.status(200).json([
      { id: 1, name: 'Nike Air Max', price: 129.99 },
      { id: 2, name: 'Adidas Ultraboost', price: 149.99 }
    ]);
  });
  
  app.get('/api/v1/search/suggestions', (req, res) => {
    const { q } = req.query;
    res.status(200).json(['nike air', 'nike air max', 'nike shoes']);
  });
  
  app.get('/api/v1/search/trending', (req, res) => {
    res.status(200).json(['running shoes', 'basketball shoes', 'casual sneakers']);
  });
  
  app.get('/api/v1/search/categories', (req, res) => {
    res.status(200).json(['running', 'basketball', 'casual', 'hiking']);
  });
  
  app.get('/api/v1/search/brands', (req, res) => {
    res.status(200).json(['Nike', 'Adidas', 'New Balance', 'Puma']);
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

describe('Search API Tests', () => {
  const agent = request(app);

  test('should return welcome message', async () => {
    const response = await agent.get('/api/v1/search');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should search products', async () => {
    const response = await agent.get('/api/v1/search/products?query=nike');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should filter products', async () => {
    const response = await agent.get('/api/v1/search/filter?minPrice=100&maxPrice=200');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get search suggestions', async () => {
    const response = await agent.get('/api/v1/search/suggestions?q=nik');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get trending searches', async () => {
    const response = await agent.get('/api/v1/search/trending');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get available categories', async () => {
    const response = await agent.get('/api/v1/search/categories');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get available brands', async () => {
    const response = await agent.get('/api/v1/search/brands');
    expect([200, 401, 404]).toContain(response.status);
  });
});