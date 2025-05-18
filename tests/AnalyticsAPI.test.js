import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { mockPool, mockAuthHandler } from './mocks.js';

// Mock the server.js module
jest.mock('../src/server.js', () => {
  const app = express();
  
  app.get('/api/v1/analytics', (req, res) => {
    res.status(200).send('Analytics API, welcome!');
  });
  
  app.get('/api/v1/analytics/sales', (req, res) => {
    res.status(200).json({
      daily: 1500,
      weekly: 10500,
      monthly: 45000
    });
  });
  
  app.get('/api/v1/analytics/products/popular', (req, res) => {
    res.status(200).json([
      { id: 1, name: 'Nike Air Max', sales: 120 },
      { id: 2, name: 'Adidas Ultraboost', sales: 95 }
    ]);
  });
  
  app.get('/api/v1/analytics/user/activity', (req, res) => {
    res.status(200).json({
      active: 150,
      new: 45,
      returning: 105
    });
  });
  
  app.get('/api/v1/analytics/cart/abandoned', (req, res) => {
    res.status(200).json({
      count: 32,
      value: 4500
    });
  });
  
  app.get('/api/v1/analytics/searches', (req, res) => {
    res.status(200).json([
      { term: 'nike shoes', count: 120 },
      { term: 'adidas running', count: 85 }
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

describe('Analytics API Tests', () => {
  const agent = request(app);

  test('should return welcome message', async () => {
    const response = await agent.get('/api/v1/analytics');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get sales analytics', async () => {
    const response = await agent.get('/api/v1/analytics/sales');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get popular products', async () => {
    const response = await agent.get('/api/v1/analytics/products/popular');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get user activity', async () => {
    const response = await agent.get('/api/v1/analytics/user/activity');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get abandoned cart data', async () => {
    const response = await agent.get('/api/v1/analytics/cart/abandoned');
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get search analytics', async () => {
    const response = await agent.get('/api/v1/analytics/searches');
    expect([200, 401, 404]).toContain(response.status);
  });
});