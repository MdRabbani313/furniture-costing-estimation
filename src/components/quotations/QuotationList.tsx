import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quotation } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { QuotationPrintModal } from './QuotationPrintModal';
import { QuotationModal } from './QuotationModal';
import { Search, Plus, Eye, Edit2, Trash2, Receipt, FileText } from 'lucide-react';

export const QuotationList: React.FC = () => {
  const { quotations, updateQuotationStatus, deleteQuotation, addInvoice, setActiveTab, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const filteredQuotations = quotations.filter(
    (q) =>
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConvertToInvoice = (q: Quotation) => {
    addInvoice({
      quotationId: q.id,
      customerId: q.customerId,
      customerName: q.customerName,
      customerPhone: q.customerPhone,
      customerGstin: q.customerGstin,
      billingAddress: q.billingAddress,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: q.items,
      subtotal: q.subtotal,
      taxTotal: q.taxTotal,
      discountTotal: q.discountAmount,
      grandTotal: q.grandTotal,
      paidAmount: 0,
      outstandingBalance: q.grandTotal,
      paymentStatus: 'Unpaid',
      createdBy: 'Sales / Billing Manager'
    });

    updateQuotationStatus(q.id, 'Converted');
    setActiveTab('invoices');
  };

  const handleDelete = (id: string, number: string) => {
    if (window.confirm(`Are you sure you want to delete Quotation ${number}?`)) {
      deleteQuotation(id);
    }
  };

  return (
    <div id="quotation-management-view" className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Commercial Quotation Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Prepare customer quotations with on-the-fly customer creation and one-click invoice conversion
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setEditingQuotation(undefined);
              setShowModal(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" /> Create Quotation
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search quotation # or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Quotation #</th>
                <th className="p-3.5">Customer / Company</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Valid Until</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-amber-600">{q.quotationNumber}</td>
                    <td className="p-3.5 font-bold text-slate-900">
                      <div>{q.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{q.customerPhone}</div>
                    </td>
                    <td className="p-3.5 text-slate-600 font-mono">{formatDate(q.date)}</td>
                    <td className="p-3.5 text-slate-600 font-mono">{formatDate(q.validUntil)}</td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 text-sm">
                      {formatCurrency(q.grandTotal, currency)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`font-bold text-[10px] px-2 py-0.5 rounded ${
                          q.status === 'Approved' || q.status === 'Converted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-1">
                      <button
                        onClick={() => setSelectedQuotation(q)}
                        title="View / Print Quotation PDF"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingQuotation(q);
                          setShowModal(true);
                        }}
                        title="Edit Quotation"
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg inline-flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleConvertToInvoice(q)}
                        title="Convert to Tax Invoice"
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg inline-flex items-center"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id, q.quotationNumber)}
                        title="Delete Quotation"
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

      {selectedQuotation && (
        <QuotationPrintModal
          quotation={selectedQuotation}
          onClose={() => setSelectedQuotation(null)}
          onConvertToInvoice={handleConvertToInvoice}
        />
      )}

      {showModal && (
        <QuotationModal
          quotationToEdit={editingQuotation}
          onClose={() => {
            setShowModal(false);
            setEditingQuotation(undefined);
          }}
        />
      )}
    </div>
  );
};
