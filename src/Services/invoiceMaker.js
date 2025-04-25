import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import { transporter } from './mailTransporter.js';
import { getOrderDataWrapper } from '../controllers/orderController.js';
import { getAddressWrapper } from '../controllers/addressController.js';

// Get current directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function writeInvoice(data) {
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    const stream = doc.pipe(new PassThrough());

    // Construct the absolute path to the logo image
    const logoPath = path.join(__dirname, '../assets/miscellaneous/logo.jpeg');

    // Header with SneakerNest branding
    doc.image(logoPath, 50, 50, { width: 50 });
    doc
      .fontSize(20)
      .text('SneakerNest', 120, 60);

    doc.y = 120;

    // Invoice header
    doc
        .fontSize(20)
        .text('INVOICE', 50, doc.y)
        .moveDown();

    // Order details
    doc
      .fontSize(12)
      .text(`Order #: ${data.orderNumber}`, { align: 'left' })
      .text(`Order Date: ${new Date(data.timeOrdered).toLocaleString()}`, { align: 'left' })
      .moveDown();
  
    // Delivery address
    doc
        .fontSize(10)
        .text(`Address Title: ${data.deliveryAddress.addressTitle}`, { align: 'left' })
        .text(`Country: ${data.deliveryAddress.country}`, { align: 'left' })
        .text(`City: ${data.deliveryAddress.city}`, { align: 'left' })
        .text(`Province: ${data.deliveryAddress.province}`, { align: 'left' })
        .text(`Zip Code: ${data.deliveryAddress.zipCode}`, { align: 'left' })
        .text(`Street Address: ${data.deliveryAddress.streetAddress}`, { align: 'left' })
        .moveDown();
  
    // Table header
    const tableTop = doc.y;
    doc
      .fontSize(12)
      .text('Product', 50, tableTop)
      .text('Quantity', 250, tableTop)
      .text('Unit Price', 330, tableTop, { width: 80, align: 'right' })
      .text('Subtotal', 420, tableTop, { width: 80, align: 'right' });
  
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();
  
    // Order items
    let currentY = tableTop + 25;
    data.orderItems.forEach((item) => {
      const productName = item.productName;
      const quantity = item.quantity;
      const unitPrice = Number(item.purchasePrice).toFixed(2);
      const subtotal = (quantity * item.purchasePrice).toFixed(2);
  
      doc
        .fontSize(10)
        .text(productName, 50, currentY)
        .text(quantity.toString(), 250, currentY)
        .text(`$${unitPrice}`, 330, currentY, { width: 80, align: 'right' })
        .text(`$${subtotal}`, 420, currentY, { width: 80, align: 'right' });
  
      currentY += 20;
    });
  
    // Total
    doc
      .moveTo(50, currentY + 5)
      .lineTo(550, currentY + 5)
      .stroke();
  
    doc
      .fontSize(12)
      .text(`Total: $${Number(data.totalPrice).toFixed(2)}`, 420, currentY + 15, {
        width: 80,
        align: 'right',
      });
  
    // Footer
    doc.moveDown(2);
    doc.fontSize(10)
      .text('Thank you for shopping at SneakerNest!')
      .text('We appreciate your business.')
      .text(`Order Tracking ID: ${data.deliveryID}`);
  
    doc.end();
    return doc;
}

const mailSender = async (req, res) => {
    try {        
        const recipientEmail = req.params.email;
        
        if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            return res.status(400).json({ message: 'Invalid email address.' });
        }

        const orderDataObject = await getOrderDataWrapper(req);
        const req2 = {params: {addressid: orderDataObject.deliveryAddressID}};
        const addressDataObject = await getAddressWrapper(req2);
        orderDataObject.deliveryAddress = addressDataObject;

        const pdfStream = writeInvoice(orderDataObject);
        let chunks = [];
        
        pdfStream.on('data', (chunk) => chunks.push(chunk));

        pdfStream.on('end', async () => {
            const pdfBuffer = Buffer.concat(chunks);
            const mailOptions = {
                from: 'sneakernest1@gmail.com',
                to: recipientEmail,
                subject: 'Your SneakerNest Order Invoice',
                text: 'Thank you for your purchase! Please find your invoice attached.',
                attachments: [{
                    filename: 'sneakernest-invoice.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                }],
            };

            try {
                await transporter.sendMail(mailOptions);
                res.status(200).json({ message: 'Invoice sent successfully.' });
            } catch (emailError) {
                console.error('Email error:', emailError);
                res.status(500).json({ message: 'Failed to send invoice.' });
            }
        });

        pdfStream.on('error', (error) => {
            console.error('PDF error:', error);
            res.status(500).json({ message: 'Failed to generate PDF.' });
        });
            
    } catch (error) {
        console.error('Invoice error:', error);
        res.status(500).json({ message: 'Failed to process invoice.' });
    } 
}

const invoiceDownloader = async (req, res) => {
    try {
        const orderDataObject = await getOrderDataWrapper(req);
        const req2 = {params: {addressid: orderDataObject.deliveryAddressID}};
        const addressDataObject = await getAddressWrapper(req2);
        orderDataObject.deliveryAddress = addressDataObject;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sneakernest-invoice.pdf');
        
        const stream = writeInvoice(orderDataObject);
        stream.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Failed to download invoice.' });
    }
}

export { writeInvoice, mailSender, invoiceDownloader };