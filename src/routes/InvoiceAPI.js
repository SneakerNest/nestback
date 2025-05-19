// Import Express Router and invoice service functions
import { Router } from 'express';
import { mailSender, invoiceDownloader } from '../Services/invoiceMaker.js';

// Initialize Express Router
const router = Router();

// Route to send invoice via email
// Parameters:
//   - id: The invoice ID to be sent
//   - email: The recipient's email address
router.get('/mail/:id/:email', mailSender);

// Route to download invoice as a file
// Parameters:
//   - id: The invoice ID to download
router.get('/download/:id', invoiceDownloader);

// Export the router for use in the main application
export default router;