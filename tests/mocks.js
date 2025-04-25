// This file centralizes all mocks for tests

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