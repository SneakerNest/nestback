// invoiceUtils.js
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';

export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Order ID: ${order.orderID}`);
    doc.text(`Customer ID: ${order.customerID}`);
    doc.text(`Date: ${order.timeCreated}`);
    doc.moveDown();

    doc.text('Product ID', 50, doc.y, { continued: true });
    doc.text(' Quantity', 150, doc.y, { continued: true });
    doc.text(' Unit Price', 250, doc.y, { continued: true });
    doc.text(' Subtotal', 350, doc.y);
    doc.moveDown();

    order.items.forEach(item => {
      const subtotal = parseFloat(item.unitPrice) * item.quantity;
      doc.text(`${item.productID}`, 50, doc.y, { continued: true });
      doc.text(`${item.quantity}`, 150, doc.y, { continued: true });
      doc.text(`${item.unitPrice}`, 250, doc.y, { continued: true });
      doc.text(`${subtotal.toFixed(2)}`, 350, doc.y);
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total: ${order.totalPrice}`, { align: 'right' });

    doc.end();
  });
};

export const sendInvoiceEmail = async (pdfBuffer, recipientEmail) => {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: `"SneakerNest" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    subject: "Your SneakerNest Invoice",
    text: "Please find attached your invoice.",
    attachments: [
      {
        filename: 'invoice.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  });

  return info;
};
