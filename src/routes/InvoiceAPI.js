import { Router } from 'express';
import { mailSender, invoiceDownloader } from '../Services/invoiceMaker.js';

const router = Router();

router.get('/mail/:id/:email', mailSender);
router.get('/download/:id', invoiceDownloader);

export default router;