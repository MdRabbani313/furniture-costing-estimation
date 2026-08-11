import React from 'react';
import { Customer } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { X, User, Phone, Mail, MapPin, Receipt, FileText } from 'lucide-react';

interface Props {
  customer: Customer;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<Props> = ({ customer, onClose }) => {
  const { quotations, invoices, currency } = useApp();

  const customerQuotations = quotations.filter((q) => q.customerId === customer.id || q.customerName.includes(customer.name));
  const customerInvoices = invoices.filter((inv) => inv.customerId === customer.id || inv.customerName.includes(customer.name));

  const totalBilled = customerInvoices.reduce((a, inv) => a + inv.grandTotal, 0);
  const totalPaid = customerInvoices.reduce((a, inv) => a + inv.paidAmount, 0);
  const totalOutstanding = customerInvoices.reduce((a, inv) => a + inv.outstandingBalance, 0);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{customer.name}</h3>
              <p className="text-xs text-slate-400">{customer.companyName || 'Private Commercial Client'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
          {/* Contact Details */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px]">Phone</span>
              <span className="font-bold text-slate-800">{customer.phone}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Email</span>
              <span className="font-bold text-slate-800">{customer.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">GSTIN</span>
              <span className="font-mono font-bold text-amber-700">{customer.gstin || 'N/A'}</span>
            </div>
          </div>

          {/* Ledger Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-slate-900 text-white rounded-xl">
            <div>
              <span className="text-slate-400 block text-[10px]">Total Billed</span>
              <span className="font-mono font-bold text-sm text-white">{formatCurrency(totalBilled, currency)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Total Received</span>
              <span className="font-mono font-bold text-sm text-emerald-400">{formatCurrency(totalPaid, currency)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Outstanding Balance</span>
              <span className="font-mono font-bold text-sm text-rose-400">{formatCurrency(totalOutstanding, currency)}</span>
            </div>
          </div>

          {/* Customer Invoices */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-600" /> Commercial Invoices History
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-right">Total</th>
                    <th className="p-2.5 text-right">Paid</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customerInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="p-2.5 font-mono font-bold text-amber-600">{inv.invoiceNumber}</td>
                      <td className="p-2.5 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                      <td className="p-2.5 text-right font-mono">{formatCurrency(inv.grandTotal, currency)}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-600">{formatCurrency(inv.paidAmount, currency)}</td>
                      <td className="p-2.5 text-center font-bold text-[10px]">{inv.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
