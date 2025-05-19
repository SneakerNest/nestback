import { jest } from '@jest/globals';
import nodemailer from 'nodemailer';

// Mock nodemailer before importing transporter
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn().mockImplementation(callback => callback(null, true)),
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock-message-id',
      accepted: ['test@example.com'],
      rejected: []
    })
  })
}));

// Import the transporter after mocking
import { transporter } from '../src/Services/mailTransporter.js';

describe('Mail Transporter', () => {
  test('should verify SMTP connection', () => {
    return new Promise((resolve) => {
      transporter.verify((error, success) => {
        expect(error).toBeNull();
        expect(success).toBe(true);
        resolve();
      });
    });
  });
  
  test('should send email', async () => {
    const mailOptions = {
      from: 'test@example.com',
      to: 'recipient@example.com',
      subject: 'Test Email',
      text: 'This is a test email'
    };
    
    const result = await transporter.sendMail(mailOptions);
    expect(result.messageId).toBeDefined();
  });
});