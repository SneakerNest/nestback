const express = require('express');
const router = express.Router();

//controllers 
const invoiceService = require('../Services/invoiceMaker');


router.get('/mail/:id/:email', (req, res) => {
    return invoiceService.mailSender(req, res);
});

router.get('/download/:id', (req, res) => {
    return invoiceService.invoiceDownloader(req, res);
});

module.exports = router;