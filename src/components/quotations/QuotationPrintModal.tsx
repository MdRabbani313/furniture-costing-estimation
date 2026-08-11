import React from 'react';
import { Quotation } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { printQuotationDocument } from '../../utils/pdfGenerator';
import { X, Printer, CheckCircle, FileText } from 'lucide-react';

interface Props {
  quotation: Quotation;
  onClose: () => void;
  onConvertToInvoice: (quotation: Quotation) => void;
}

export const QuotationPrintModal: React.FC<Props> = ({ quotation, onClose, onConvertToInvoice }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Commercial Quotation Document</h3>
              <p className="text-xs text-slate-400 font-mono">{quotation.quotationNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Company Branding & Customer info */}
          <div className="flex flex-col sm:flex-row justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <span className="font-extrabold text-indigo-900 text-sm block">WOODCRAFT COMMERCIALS</span>
              <p className="text-slate-500">Furniture Manufacturing & Architectural Joinery</p>
              <p className="text-slate-500">Gurgaon, Haryana | GSTIN: 07AABCW1234F1Z9</p>
            </div>

            <div className="text-right">
              <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded text-[10px]">
                STATUS: {quotation.status}
              </span>
              <p className="text-slate-500 mt-1">Date: {formatDate(quotation.date)}</p>
              <p className="text-slate-500">Valid Until: {formatDate(quotation.validUntil)}</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <strong className="text-slate-800 block text-xs mb-1">Customer Details:</strong>
            <div className="font-bold text-slate-900 text-sm">{quotation.customerName}</div>
            <p className="text-slate-600">{quotation.billingAddress}</p>
            <p className="text-slate-600">Phone: {quotation.customerPhone} | Email: {quotation.customerEmail}</p>
          </div>

          {/* Line items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Product Item</th>
                  <th className="p-3 text-center">Variant</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Unit Rate</th>
                  <th className="p-3 text-right">Total (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotation.items.map((item) => (
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

          {/* Financial Totals */}
          <div className="w-72 ml-auto p-4 bg-slate-900 text-white rounded-xl space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal:</span>
              <span className="font-mono">{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>GST Tax Total:</span>
              <span className="font-mono">{formatCurrency(quotation.taxTotal)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-amber-400 border-t border-slate-800 pt-2 text-sm">
              <span>Grand Total:</span>
              <span className="font-mono">{formatCurrency(quotation.grandTotal)}</span>
            </div>
          </div>

          {quotation.termsAndConditions && (
            <div className="p-3 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs rounded">
              <strong>Terms & Conditions:</strong>
              <p className="whitespace-pre-line mt-1">{quotation.termsAndConditions}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => printQuotationDocument(quotation)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>

          <button
            onClick={() => {
              onClose();
              onConvertToInvoice(quotation);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" /> Convert to Tax Invoice
          </button>
        </div>
      </div>
    </div>
  );
};
