import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { X, CheckCircle, CreditCard } from 'lucide-react';

interface Props {
  invoice: Invoice;
  onClose: () => void;
}

export const PaymentRecordModal: React.FC<Props> = ({ invoice, onClose }) => {
  const { recordPayment, currency } = useApp();

  const [amount, setAmount] = useState<number>(invoice.outstandingBalance);
  const [method, setMethod] = useState<'UPI' | 'Bank Transfer' | 'Cheque' | 'Cash' | 'Card'>('Bank Transfer');
  const [referenceNo, setReferenceNo] = useState<string>(`TXN-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    recordPayment(invoice.id, {
      date: new Date().toISOString().split('T')[0],
      amount,
      method,
      referenceNo,
      recordedBy: 'Accounts Manager',
      notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Record Invoice Payment</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span>Invoice:</span>
              <span className="font-mono text-amber-600">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Customer:</span>
              <span className="font-semibold">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between text-rose-600 font-bold border-t border-slate-200 pt-1 mt-1">
              <span>Outstanding Balance:</span>
              <span className="font-mono">{formatCurrency(invoice.outstandingBalance, currency)}</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹)</label>
            <input
              type="number"
              max={invoice.outstandingBalance}
              required
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-base text-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Mode</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
            >
              <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="Card">Credit/Debit Card</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reference / UTR / Cheque No.</label>
            <input
              type="text"
              required
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Payment Notes / Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Advance payment received..."
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" /> Save Payment Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
