import React from 'react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printInvoiceDocument } from '../../utils/pdfGenerator';
import { X, Printer, Receipt } from 'lucide-react';

interface Props {
  invoice: Invoice;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
}

export const InvoicePrintModal: React.FC<Props> = ({ invoice, onClose, onRecordPayment }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Tax Invoice Document</h3>
              <p className="text-xs text-slate-400 font-mono">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <span className="font-extrabold text-emerald-800 text-sm block">WOODCRAFT COMMERCIALS</span>
              <p className="text-slate-500">Furniture Manufacturing & Commercial Interiors</p>
              <p className="text-slate-500">GSTIN: 07AABCW1234F1Z9</p>
            </div>

            <div className="text-right">
              <span
                className={`font-bold px-2.5 py-0.5 rounded text-[10px] uppercase ${
                  invoice.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                PAYMENT: {invoice.paymentStatus}
              </span>
              <p className="text-slate-500 mt-1">Invoice Date: {formatDate(invoice.invoiceDate)}</p>
              <p className="text-slate-500">Due Date: {formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800 block text-xs mb-1">Customer & Billing Info:</strong>
            <div className="font-bold text-slate-900 text-sm">{invoice.customerName}</div>
            <p className="text-slate-600">{invoice.billingAddress}</p>
            <p className="text-slate-600">Phone: {invoice.customerPhone}</p>
            {invoice.customerGstin && <p className="text-slate-600">GSTIN: {invoice.customerGstin}</p>}
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Product Description</th>
                  <th className="p-3 text-center">Variant</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.productName}</div>
                      <div className="text-slate-500 text-[11px]">{item.description}</div>
                    </td>
                    <td className="p-3 text-center font-medium">{item.variantOrSize}</td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(item.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="w-80 ml-auto p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>GST Tax (18%):</span>
              <span className="font-mono">{formatCurrency(invoice.taxTotal)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-white border-t border-slate-800 pt-2 text-sm">
              <span>Invoice Total:</span>
              <span className="font-mono">{formatCurrency(invoice.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Amount Paid:</span>
              <span className="font-mono">{formatCurrency(invoice.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-rose-400 font-bold border-t border-slate-800 pt-1">
              <span>Outstanding Balance:</span>
              <span className="font-mono">{formatCurrency(invoice.outstandingBalance)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => printInvoiceDocument(invoice)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Tax Invoice PDF
          </button>

          {invoice.outstandingBalance > 0 && (
            <button
              onClick={() => {
                onClose();
                onRecordPayment(invoice);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              Record Payment
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
