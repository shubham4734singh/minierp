import PDFDocument from 'pdfkit';
import { Response } from 'express';

export const generateChallanPDF = (challan: any, res: Response) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Challan-${challan.challanNumber}.pdf`);

  doc.pipe(res);

  const primaryColor = '#18181b'; // zinc-900
  const secondaryColor = '#71717a'; // zinc-500
  const accentColor = '#e4e4e7'; // zinc-200

  // --- HEADER ---
  doc
    .fillColor(primaryColor)
    .fontSize(28)
    .font('Helvetica-Bold')
    .text('INVOICE', 50, 50, { align: 'right' });

  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text('Sales Challan / Tax Invoice', 50, 80, { align: 'right' });

  // Company Brand (Top Left)
  doc
    .fillColor(primaryColor)
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('ERP SYSTEM', 50, 50);
  
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor(secondaryColor)
    .text('123 Corporate Blvd.', 50, 75)
    .text('Tech Park, Phase 1', 50, 90)
    .text('GSTIN: 22AAAAA0000A1Z5', 50, 105);

  doc.moveDown(3);

  // --- INVOICE DETAILS & CUSTOMER ---
  const detailsTop = 150;
  
  // Left: Bill To
  doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('BILL TO:', 50, detailsTop);
  doc.font('Helvetica-Bold').fontSize(12).text(challan.customer.businessName || challan.customer.name, 50, detailsTop + 15);
  doc.font('Helvetica').fontSize(10).fillColor(secondaryColor);
  doc.text(challan.customer.name, 50, detailsTop + 30);
  doc.text(challan.customer.address || '', 50, detailsTop + 45);
  if (challan.customer.gstNumber) doc.text(`GSTIN: ${challan.customer.gstNumber}`, 50, detailsTop + 60);
  doc.text(`Phone: ${challan.customer.mobile}`, 50, detailsTop + 75);

  // Right: Meta
  doc.fontSize(10).font('Helvetica-Bold').fillColor(primaryColor).text('Invoice No:', 350, detailsTop);
  doc.font('Helvetica').fillColor(secondaryColor).text(challan.challanNumber, 430, detailsTop);
  
  doc.font('Helvetica-Bold').fillColor(primaryColor).text('Date:', 350, detailsTop + 20);
  doc.font('Helvetica').fillColor(secondaryColor).text(new Date(challan.createdAt).toLocaleDateString(), 430, detailsTop + 20);
  
  doc.font('Helvetica-Bold').fillColor(primaryColor).text('Status:', 350, detailsTop + 40);
  doc.font('Helvetica').fillColor(secondaryColor).text(challan.status, 430, detailsTop + 40);

  // --- TABLE HEADER ---
  const tableTop = 260;
  
  doc
    .rect(50, tableTop, 495, 25)
    .fill(primaryColor);

  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
  doc.text('ITEM', 60, tableTop + 8);
  doc.text('SKU', 250, tableTop + 8);
  doc.text('QTY', 350, tableTop + 8, { width: 40, align: 'center' });
  doc.text('PRICE', 410, tableTop + 8, { width: 60, align: 'right' });
  doc.text('TOTAL', 480, tableTop + 8, { width: 60, align: 'right' });

  // --- TABLE ROWS ---
  let y = tableTop + 35;
  let grandTotal = 0;

  for (const item of challan.items) {
    const total = item.quantity * item.unitPrice;
    grandTotal += total;

    // Line separator
    doc.moveTo(50, y - 5).lineTo(545, y - 5).lineWidth(0.5).strokeColor(accentColor).stroke();

    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10);
    doc.text(item.productName, 60, y, { width: 180 });
    
    doc.font('Helvetica').fillColor(secondaryColor);
    doc.text(item.productSku, 250, y);
    doc.text(item.quantity.toString(), 350, y, { width: 40, align: 'center' });
    
    doc.fillColor(primaryColor);
    doc.text(`INR ${item.unitPrice.toLocaleString('en-IN')}`, 410, y, { width: 60, align: 'right' });
    doc.text(`INR ${total.toLocaleString('en-IN')}`, 480, y, { width: 60, align: 'right' });

    y += 25;
  }

  // --- FOOTER TOTALS ---
  doc.moveTo(50, y).lineTo(545, y).lineWidth(1).strokeColor(primaryColor).stroke();
  
  doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor);
  doc.text('GRAND TOTAL:', 350, y + 15, { width: 100, align: 'right' });
  doc.text(`INR ${grandTotal.toLocaleString('en-IN')}`, 460, y + 15, { width: 80, align: 'right' });

  // --- FOOTER NOTES ---
  doc.font('Helvetica').fontSize(9).fillColor(secondaryColor);
  doc.text('Terms & Conditions:', 50, y + 60);
  doc.text('1. Payment is due within 30 days.', 50, y + 75);
  doc.text('2. Please include invoice number on your check.', 50, y + 90);
  
  doc.text('Thank you for your business!', 50, y + 130, { align: 'center', width: 495 });

  doc.end();
};
