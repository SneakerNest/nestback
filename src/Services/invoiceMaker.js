const path = require('path');
const PDFDocument = require('pdfkit');
const { PassThrough } = require('stream');

const fs = require('fs');

const mailService = require('./mailTransporter')
const orderController = require('../controllers/order');
const addressController = require('../controllers/address');

function writeInvoice(data) {
    // Create a new PDF document instance
    const doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    
    // Pipe the PDF stream
    const stream = doc.pipe(new PassThrough());

    // Construct the absolute path to the logo image
    const logoPath = path.join(__dirname, '../assets/miscellaneous/logo.jpeg');


    // ------------------------------------------
    //    ZAD À DOS TITLE AND LOGO
    // ------------------------------------------
    doc.image(logoPath, 50, 50, { width: 50 });

    doc
      .fontSize(20)
      .text('Zad à Dos', 120, 60);

    //    Move the cursor down before printing “INVOICE”
    //    so that it appears on the next “line”
    //    Manually set doc.y a bit lower than the logo
    doc.y = 120;

    // ------------------------------------------
    //    INVOICE HEADER 
    // ------------------------------------------
    doc
        .fontSize(20)
        .text('INVOICE', 50, doc.y)
        .moveDown();

    // Order Number and Date (timeOrdered)
    doc
      .fontSize(12)
      .text(`Order #: ${data.orderNumber}`, { align: 'left' })
      .text(`Order Date: ${new Date(data.timeOrdered).toLocaleString()}`, { align: 'left' })
      .moveDown();
  
    // Delivery Address Details
    doc
        .fontSize(10)
        .text(`Address Title: ${data.deliveryAddress.addressTitle}`, { align: 'left' })
        .text(`Country: ${data.deliveryAddress.country}`, { align: 'left' })
        .text(`City: ${data.deliveryAddress.city}`, { align: 'left' })
        .text(`Province: ${data.deliveryAddress.province}`, { align: 'left' })
        .text(`Zip Code: ${data.deliveryAddress.zipCode}`, { align: 'left' })
        .text(`Street Address: ${data.deliveryAddress.streetAddress}`, { align: 'left' })
        .moveDown();
  
    // ------------------------------------------
    //    TABLE HEADER (ITEM / QTY / PRICE / ...)
    // ------------------------------------------
    const tableTop = doc.y;
  
    // Column Titles
    doc
      .fontSize(12)
      .text('Item', 50, tableTop)
      .text('Qty', 250, tableTop)
      .text('Unit Price', 330, tableTop, { width: 80, align: 'right' })
      .text('Subtotal', 420, tableTop, { width: 80, align: 'right' });
  
    // Divider line
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();
  
    // ---------------------------
    //   TABLE BODY (ORDER ITEMS)
    // ---------------------------
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
  
    // --------------------------------
    //   TOTAL PRICE
    // --------------------------------
    // Draw a horizontal line above “Total”
    doc
      .moveTo(50, currentY + 5)
      .lineTo(550, currentY + 5)
      .stroke();
  
    // Print the total in bold
    doc
      .fontSize(12)
      .text(`Total: $${Number(data.totalPrice).toFixed(2)}`, 420, currentY + 15, {
        width: 80,
        align: 'right',
      });
  
    // --------------------------------
    //   FOOTER OR ADDITIONAL INFO
    // --------------------------------
    // Spacing before footer
    doc.moveDown(2);
  
    doc.fontSize(10).text('Thank you for your purchase!');
    
    // If you have any other fields you want to show:
    // doc.text(`Delivery ID: ${data.deliveryID}`);
  
    // Finalize PDF file
    doc.end();
    return doc;
  }

const mailSender = async (req, res) => {
    try {        
        // Get the email address from the query parameters
        const recipientEmail = req.params.email;
        console.log(recipientEmail);

        // Validate the email address
        if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
        return res.status(400).json({ message: 'Invalid or missing email address.' });
        }

        // Fetch data from the order controller function
        const orderDataObject = await orderController.getOrderDataWrapper(req);

        //Fetch the address details from address controller
        const req2 = {params: {addressid: orderDataObject.deliveryAddressID}};
        const addressDataObject = await addressController.getAddressWrapper(req2);

        // combine order and address data
        orderDataObject.deliveryAddress = addressDataObject

        // Generate PDF as a buffer
        const pdfStream = writeInvoice(orderDataObject);

        //listening for data from the stream
        let chunks = [];
        pdfStream.on('data', (chunk) => chunks.push(chunk));

        //when the stream ends (i.e when all data has been received), process the remaining chunks
        pdfStream.on('end', async () => {
            //combine all collected chunks into a single buffer
            const pdfBuffer = Buffer.concat(chunks);

            // Send email with PDF attachment
            const mailOptions = {
                from: 'zadados308@gmail.com',
                to: recipientEmail, // Replace with recipient's email
                subject: 'Your Invoice',
                text: 'Please find your invoice attached.',
                attachments: [
                    {
                    filename: 'invoice.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                    },
                ],
            };

            try {
                await mailService.transporter.sendMail(mailOptions);
                console.log('Email sent successfully');

                // Respond to the API caller with success message
                res.status(200).json({ message: 'Invoice sent successfully via email.' });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                res.status(500).json({ message: 'Failed to send invoice via email.' });
            }
        });

        pdfStream.on('error', (streamError) => {
            console.error('Error generating PDF:', streamError);
            res.status(500).json({ message: 'Failed to generate invoice PDF.' });
        });
            
    } catch (error) {
        console.error('Error generating invoice:', error);
        res.status(500).json({ message: 'Failed to generate invoice.' });
    } 
}

const invoiceDownloader = async (req, res) => {
    try {
        // Fetch data from the order controller function
        const orderDataObject = await orderController.getOrderDataWrapper(req); 

        //Fetch the address details from address controller
        const req2 = {params: {addressid: orderDataObject.deliveryAddressID}};
        const addressDataObject = await addressController.getAddressWrapper(req2);

        // combine order and address data
        orderDataObject.deliveryAddress = addressDataObject

        // Set headers once for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=invoice.pdf');
        // Generate and pipe the PDF
        const stream = writeInvoice(orderDataObject);
        stream.pipe(res);
      } catch (error) {
        console.error('Error generating invoice on download:', error);
        res.status(500).json({ message: 'Failed to generate invoice on download.' });
      }
}

module.exports = { writeInvoice, mailSender,invoiceDownloader };