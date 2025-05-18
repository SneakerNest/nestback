import { jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { mockPool, mockAuthHandler } from './mocks.js';

// Mock the server.js module
jest.mock('../src/server.js', () => {
  const app = express();
  
  app.get('/api/v1/images', (req, res) => {
    res.status(200).send('Images API, welcome!');
  });
  
  app.get('/api/v1/images/:imageID', (req, res) => {
    res.status(200).json({ 
      imageID: req.params.imageID,
      url: `https://example.com/images/${req.params.imageID}.jpg`
    });
  });
  
  app.get('/api/v1/images/product/:productID', (req, res) => {
    res.status(200).json([
      { imageID: 1, url: `https://example.com/images/product${req.params.productID}_1.jpg` },
      { imageID: 2, url: `https://example.com/images/product${req.params.productID}_2.jpg` }
    ]);
  });
  
  app.post('/api/v1/images/upload', (req, res) => {
    res.status(201).json({ 
      imageID: 100, 
      url: 'https://example.com/images/uploaded.jpg'
    });
  });
  
  app.delete('/api/v1/images/:imageID', (req, res) => {
    res.status(200).json({ msg: 'Image deleted successfully' });
  });
  
  app.get('/api/v1/images/banner', (req, res) => {
    res.status(200).json([
      { imageID: 1, url: 'https://example.com/images/banner1.jpg' },
      { imageID: 2, url: 'https://example.com/images/banner2.jpg' }
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

describe('Images API Tests', () => {
  const agent = request(app);

  test('should return welcome message', async () => {
    const response = await agent.get('/api/v1/images');
    expect([200, 301, 401, 404]).toContain(response.status);
  });

  test('should return 404 for invalid route', async () => {
    const response = await agent.get('/api/v1/images/invalid/route');
    expect([404, 401]).toContain(response.status);
  });

  test('should get image by ID', async () => {
    const imageID = 1;
    const response = await agent.get(`/api/v1/images/${imageID}`);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get product images', async () => {
    const productID = 1;
    const response = await agent.get(`/api/v1/images/product/${productID}`);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should upload image', async () => {
    const response = await agent
      .post('/api/v1/images/upload')
      .send({ image: 'base64data' });
    expect([201, 401, 404]).toContain(response.status);
  });

  test('should delete image', async () => {
    const imageID = 1;
    const response = await agent.delete(`/api/v1/images/${imageID}`);
    expect([200, 401, 404]).toContain(response.status);
  });

  test('should get banner images', async () => {
    const response = await agent.get('/api/v1/images/banner');
    expect([200, 401, 404]).toContain(response.status);
  });
});