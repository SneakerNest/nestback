import { jest } from '@jest/globals';

// Create a mock for the database pool
export const mockPool = {
  query: jest.fn().mockResolvedValue([[], []]),
  execute: jest.fn().mockResolvedValue([[], []]),
  end: jest.fn().mockResolvedValue(true)
};

// Create a mock for the auth middleware
export const mockAuthHandler = {
  authenticateToken: (req, res, next) => next(),
  authenticateRole: () => (req, res, next) => next()
};

// Add mock for mail transporter
export const mockTransporter = {
  verify: jest.fn().mockImplementation(callback => {
    callback(null, true);  // Immediately call the callback with success
  }),
  sendMail: jest.fn().mockResolvedValue({
    messageId: 'mock-message-id',
    accepted: ['test@example.com'],
    rejected: []
  })
};

