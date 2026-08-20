import { Quotation, Invoice } from '../types';
import { formatCurrency, formatDate } from './formatters';

export const printQuotationDocument = (quotation: Quotation) => {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return;

  const itemsHtml = quotation.items.map((item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong>
        <div style="font-size: 12px; color: #4b5563; margin-top: 2px;">${item.description}</div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.variantOrSize}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.discountPercent}%</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.totalAmount)}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Quotation - ${quotation.quotationNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e3a8a; }
          .company-tag { font-size: 13px; color: #6b7280; margin-top: 4px; }
          .title { font-size: 28px; font-weight: bold; color: #2563eb; text-align: right; }
          .meta-box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { background: #1e293b; color: white; padding: 12px 10px; text-align: left; font-size: 13px; font-weight: 600; }
          .summary { width: 320px; margin-left: auto; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .grand-total { font-size: 18px; font-weight: bold; color: #1e3a8a; border-top: 2px solid #cbd5e1; padding-top: 10px; margin-top: 8px; }
          .terms { margin-top: 40px; padding: 16px; background: #fffbe0; border-left: 4px solid #eab308; border-radius: 4px; font-size: 13px; white-space: pre-line; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #6b7280; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; font-size: 14px; border-radius: 6px; cursor: pointer;">🖨️ Print / Save as PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="logo">ARBUDA STEEL INDUSTRIES</div>
            <div class="company-tag">Commercial Furniture, Steel & Architectural Joinery</div>
            <div style="font-size: 12px; color: #4b5563; margin-top: 6px;">
              GIDC Industrial Estate, Ahmedabad, Gujarat 382445<br/>
              GSTIN: 24AABCA9876F1Z2 | Phone: +91 98765 43210 | sales@arbudasteel.com
            </div>
          </div>
          <div>
            <div class="title">COMMERCIAL QUOTATION</div>
            <div style="text-align: right; margin-top: 8px; font-weight: bold; font-size: 16px; color: #374151;">
              ${quotation.quotationNumber}
            </div>
            <div style="text-align: right; font-size: 13px; color: #6b7280; margin-top: 4px;">
              Date: ${formatDate(quotation.date)}<br/>
              Valid Until: ${formatDate(quotation.validUntil)}
            </div>
          </div>
        </div>

        <div class="meta-box">
          <div>
            <strong style="color: #1e293b; font-size: 14px;">QUOTATION PREPARED FOR:</strong>
            <div style="font-size: 15px; font-weight: bold; margin-top: 4px; color: #1e3a8a;">${quotation.customerName}</div>
            <div style="font-size: 13px; color: #4b5563; margin-top: 2px;">
              ${quotation.billingAddress}<br/>
              Phone: ${quotation.customerPhone} | Email: ${quotation.customerEmail}<br/>
              ${quotation.customerGstin ? `GSTIN: ${quotation.customerGstin}` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <strong style="color: #1e293b; font-size: 14px;">PREPARED BY:</strong>
            <div style="font-size: 14px; font-weight: 500; margin-top: 4px; color: #374151;">${quotation.createdBy}</div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Status: <span style="font-weight: bold; color: #16a34a;">${quotation.status}</span></div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Product & Specifications</th>
              <th style="text-align: center;">Variant</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Rate</th>
              <th style="text-align: right;">Disc</th>
              <th style="text-align: right;">Total (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(quotation.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>Discount Amount:</span>
            <span>- ${formatCurrency(quotation.discountAmount)}</span>
          </div>
          <div class="summary-row">
            <span>GST / Taxes (18%):</span>
            <span>${formatCurrency(quotation.taxTotal)}</span>
          </div>
          <div class="summary-row grand-total">
            <span>Grand Total:</span>
            <span>${formatCurrency(quotation.grandTotal)}</span>
          </div>
        </div>

        <div class="terms">
          <strong>TERMS & CONDITIONS:</strong><br/>
          ${quotation.termsAndConditions}
        </div>

        <div class="footer">
          <div>Thank you for choosing Woodcraft Commercials!</div>
          <div style="text-align: right;">
            <strong>Authorized Signatory</strong><br/><br/>
            ___________________________
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};

export const printInvoiceDocument = (invoice: Invoice) => {
  const printWindow = window.open('', '_blank', 'width=900,height=1000');
  if (!printWindow) return;

  const itemsHtml = invoice.items.map((item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.productName}</strong>
        <div style="font-size: 12px; color: #4b5563; margin-top: 2px;">${item.description}</div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.variantOrSize}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.totalAmount)}</td>
    </tr>
  `).join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #065f46; }
          .company-tag { font-size: 13px; color: #6b7280; margin-top: 4px; }
          .title { font-size: 28px; font-weight: bold; color: #059669; text-align: right; }
          .meta-box { background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { background: #064e3b; color: white; padding: 12px 10px; text-align: left; font-size: 13px; font-weight: 600; }
          .summary { width: 340px; margin-left: auto; background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
          .grand-total { font-size: 18px; font-weight: bold; color: #065f46; border-top: 2px solid #cbd5e1; padding-top: 10px; margin-top: 8px; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; text-transform: uppercase; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #6b7280; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #059669; color: white; border: none; padding: 10px 20px; font-size: 14px; border-radius: 6px; cursor: pointer;">🖨️ Print / Save Tax Invoice PDF</button>
        </div>

        <div class="header">
          <div>
            <div class="logo">ARBUDA STEEL INDUSTRIES</div>
            <div class="company-tag">Commercial Furniture, Steel & Architectural Joinery</div>
            <div style="font-size: 12px; color: #4b5563; margin-top: 6px;">
              GIDC Industrial Estate, Ahmedabad, Gujarat 382445<br/>
              GSTIN: 24AABCA9876F1Z2 | Phone: +91 98765 43210 | billing@arbudasteel.com
            </div>
          </div>
          <div>
            <div class="title">TAX INVOICE</div>
            <div style="text-align: right; margin-top: 8px; font-weight: bold; font-size: 18px; color: #111827;">
              ${invoice.invoiceNumber}
            </div>
            <div style="text-align: right; font-size: 13px; color: #4b5563; margin-top: 4px;">
              Invoice Date: ${formatDate(invoice.invoiceDate)}<br/>
              Due Date: ${formatDate(invoice.dueDate)}
            </div>
          </div>
        </div>

        <div class="meta-box">
          <div>
            <strong style="color: #064e3b; font-size: 14px;">BILLED TO CUSTOMER:</strong>
            <div style="font-size: 15px; font-weight: bold; margin-top: 4px; color: #065f46;">${invoice.customerName}</div>
            <div style="font-size: 13px; color: #374151; margin-top: 2px;">
              ${invoice.billingAddress}<br/>
              Phone: ${invoice.customerPhone}<br/>
              ${invoice.customerGstin ? `GSTIN: ${invoice.customerGstin}` : ''}
            </div>
          </div>
          <div style="text-align: right;">
            <strong style="color: #064e3b; font-size: 14px;">PAYMENT STATUS:</strong>
            <div style="margin-top: 6px;">
              <span class="status-badge" style="background: #dcfce7; color: #15803d; border: 1px solid #86efac;">
                ${invoice.paymentStatus}
              </span>
            </div>
            <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">Created by: ${invoice.createdBy}</div>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">#</th>
              <th>Description</th>
              <th style="text-align: center;">Size / Variant</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit Rate</th>
              <th style="text-align: right;">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>${formatCurrency(invoice.subtotal)}</span>
          </div>
          <div class="summary-row">
            <span>GST Tax Total (18%):</span>
            <span>${formatCurrency(invoice.taxTotal)}</span>
          </div>
          <div class="summary-row grand-total">
            <span>Invoice Total:</span>
            <span>${formatCurrency(invoice.grandTotal)}</span>
          </div>
          <div class="summary-row" style="color: #16a34a; font-weight: bold; margin-top: 8px;">
            <span>Amount Paid:</span>
            <span>${formatCurrency(invoice.paidAmount)}</span>
          </div>
          <div class="summary-row" style="color: #dc2626; font-weight: bold; border-top: 1px dashed #cbd5e1; padding-top: 6px; margin-top: 6px;">
            <span>Outstanding Balance:</span>
            <span>${formatCurrency(invoice.outstandingBalance)}</span>
          </div>
        </div>

        <div class="footer">
          <div>
            <strong>Bank Account Details for Payment:</strong><br/>
            Bank: HDFC Bank Ltd | A/C No: 50200012345678<br/>
            IFSC: HDFC0000123 | Branch: Cyber City Gurgaon
          </div>
          <div style="text-align: right;">
            <strong>For Woodcraft Commercials</strong><br/><br/>
            ___________________________<br/>
            Authorized Signatory
          </div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
};
