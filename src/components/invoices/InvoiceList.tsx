import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { InvoicePrintModal } from './InvoicePrintModal';
import { PaymentRecordModal } from './PaymentRecordModal';
import { InvoiceModal } from './InvoiceModal';
import { Search, Plus, Eye, Edit2, Trash2, Filter, CreditCard } from 'lucide-react';

export const InvoiceList: React.FC = () => {
  const { invoices, deleteInvoice, permissions, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string, number: string) => {
    if (window.confirm(`Are you sure you want to delete Invoice ${number}?`)) {
      deleteInvoice(id);
    }
  };

  return (
    <div id="invoice-management-view" className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Invoices & Payment Tracking</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Issue commercial tax invoices, record partial/full payments, and track outstanding receivables
          </p>
        </div>

        <button
          onClick={() => {
            setEditingInvoice(undefined);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Direct Tax Invoice
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-800"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Invoice Date</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-right">Paid Amount</th>
                <th className="p-3.5 text-right">Outstanding</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                    No tax invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-amber-600">{inv.invoiceNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">{inv.customerName}</td>
                    <td className="p-3.5 text-slate-600 font-mono">{formatDate(inv.invoiceDate)}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(inv.grandTotal, currency)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-600">
                      {formatCurrency(inv.paidAmount, currency)}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-rose-600">
                      {formatCurrency(inv.outstandingBalance, currency)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`font-bold text-[10px] px-2 py-0.5 rounded uppercase ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.paymentStatus === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-1">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        title="View / Print Tax Invoice PDF"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingInvoice(inv);
                          setShowModal(true);
                        }}
                        title="Edit Invoice"
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg inline-flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {inv.outstandingBalance > 0 && permissions.canRecordPayments && (
                        <button
                          onClick={() => setPaymentInvoice(inv)}
                          title="Record Payment Entry"
                          className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg inline-flex items-center"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                        title="Delete Invoice"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onRecordPayment={(inv) => setPaymentInvoice(inv)}
        />
      )}

      {paymentInvoice && (
        <PaymentRecordModal
          invoice={paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
        />
      )}

      {showModal && (
        <InvoiceModal
          invoiceToEdit={editingInvoice}
          onClose={() => {
            setShowModal(false);
            setEditingInvoice(undefined);
          }}
        />
      )}
    </div>
  );
};
