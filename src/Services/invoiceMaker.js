import { pool } from '../config/database.js';
import PDFDocument from 'pdfkit';
import { PassThrough } from 'stream';
import path from 'path';
import { transporter } from './mailTransporter.js';
import { getOrderWrapper } from '../controllers/orderController.js';
import { getAddressWrapper } from '../controllers/addressController.js';

const writeInvoice = (data) => {
  const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
  const stream = doc.pipe(new PassThrough());
  const logoPath = path.resolve('src/assets/logo.jpeg');

  doc.image(logoPath, 50, 50, { width: 50 });
  doc.fontSize(20).text('SneakerNest', 120, 60);
  doc.y = 120;

  doc.fontSize(20).text('INVOICE', 50, doc.y).moveDown();

  doc
    .fontSize(12)
    .text(`Order #: ${data.orderNumber}`)
    .text(`Order Date: ${new Date(data.timeOrdered).toLocaleString()}`)
    .moveDown();

  doc
    .fontSize(10)
    .text(`Address Title: ${data.deliveryAddress.addressTitle}`)
    .text(`Country: ${data.deliveryAddress.country}`)
    .text(`City: ${data.deliveryAddress.city}`)
    .text(`Province: ${data.deliveryAddress.province}`)
    .text(`Zip Code: ${data.deliveryAddress.zipCode}`)
    .text(`Street Address: ${data.deliveryAddress.streetAddress}`)
    .moveDown();

  const tableTop = doc.y;
  doc.fontSize(12).text('Item', 50, tableTop)
    .text('Qty', 250, tableTop)
    .text('Unit Price', 330, tableTop, { width: 80, align: 'right' })
    .text('Subtotal', 420, tableTop, { width: 80, align: 'right' });

  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let currentY = tableTop + 25;
  data.orderItems.forEach(item => {
    const subtotal = (item.quantity * item.purchasePrice).toFixed(2);
    doc.fontSize(10)
      .text(item.productName, 50, currentY)
      .text(item.quantity.toString(), 250, currentY)
      .text(`₺${Number(item.purchasePrice).toFixed(2)}`, 330, currentY, { width: 80, align: 'right' })
      .text(`₺${subtotal}`, 420, currentY, { width: 80, align: 'right' });
    currentY += 20;
  });

  doc.moveTo(50, currentY + 5).lineTo(550, currentY + 5).stroke();
  doc.fontSize(12)
    .text(`Total: ₺${Number(data.totalPrice).toFixed(2)}`, 420, currentY + 15, {
      width: 80,
      align: 'right',
    });

  doc.moveDown(2);
  doc.fontSize(10).text('Thank you for your purchase!');
  doc.end();
  return doc;
};

const sendInvoiceByEmail = async (req, res) => {
  try {
    const recipientEmail = req.params.email;
    if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      return res.status(400).json({ message: 'Invalid or missing email address.' });
    }

    const orderData = await getOrderWrapper(req);
    const addressData = await getAddressWrapper({ params: { addressid: orderData.deliveryAddressID } });
    orderData.deliveryAddress = addressData;

    const pdfStream = writeInvoice(orderData);
    let chunks = [];
    pdfStream.on('data', (chunk) => chunks.push(chunk));

    pdfStream.on('end', async () => {
      const pdfBuffer = Buffer.concat(chunks);
      const mailOptions = {
        from: 'sneakernest@store.com',
        to: recipientEmail,
        subject: 'Your SneakerNest Invoice',
        text: 'Find your invoice attached.',
        attachments: [
          {
            filename: 'invoice.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Invoice sent successfully via email.' });
      } catch (emailError) {
        console.error('Email send error:', emailError);
        res.status(500).json({ message: 'Failed to send invoice via email.' });
      }
    });

    pdfStream.on('error', (streamErr) => {
      console.error('PDF Stream error:', streamErr);
      res.status(500).json({ message: 'Failed to generate invoice PDF.' });
    });
  } catch (err) {
    console.error('Invoice generation error:', err);
    res.status(500).json({ message: 'Failed to generate invoice.' });
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const orderData = await getOrderWrapper(req);
    const addressData = await getAddressWrapper({ params: { addressid: orderData.deliveryAddressID } });
    orderData.deliveryAddress = addressData;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');

    const stream = writeInvoice(orderData);
    stream.pipe(res);
  } catch (err) {
    console.error('Invoice download error:', err);
    res.status(500).json({ message: 'Failed to download invoice.' });
  }
};

export { writeInvoice, sendInvoiceByEmail, downloadInvoice };
