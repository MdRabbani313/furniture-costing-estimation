import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CostingRecord, ProductCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { CostingDetailModal } from './CostingDetailModal';
import { Search, Filter, Eye, FileText, Trash2, PlusCircle, Calculator } from 'lucide-react';

export const CostingList: React.FC = () => {
  const { costings, deleteCosting, setActiveTab, addQuotation, customers, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedCosting, setSelectedCosting] = useState<CostingRecord | null>(null);

  const categories = ['All', 'Box Bed', 'Wardrobe', 'Office Table', 'Study Table', 'Dressing Table', 'Shoe Rack', 'TV Unit', 'Deewan', 'Mandir'];

  const filteredCostings = costings.filter((c) => {
    const matchesSearch =
      c.costingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleConvertToQuotation = (costing: CostingRecord) => {
    const defaultCustomer = customers[0] || {
      id: 'cust-temp',
      name: 'Walk-in Commercial Customer',
      email: 'customer@woodcraft.com',
      phone: '+91 98000 00000',
      billingAddress: 'Client Site'
    };

    addQuotation({
      customerId: defaultCustomer.id,
      customerName: defaultCustomer.name,
      customerEmail: defaultCustomer.email,
      customerPhone: defaultCustomer.phone,
      customerGstin: defaultCustomer.gstin,
      billingAddress: defaultCustomer.billingAddress,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          id: `qi-${Date.now()}`,
          costingId: costing.id,
          productName: costing.productName,
          description: `Furniture Costing ${costing.costingNumber} (${costing.variantName})`,
          variantOrSize: costing.variantName,
          quantity: costing.quantity,
          unitPrice: costing.baseSellingPrice,
          discountPercent: 0,
          netPrice: costing.baseSellingPrice,
          gstPercent: costing.gstPercent,
          totalAmount: costing.grandTotal
        }
      ],
      subtotal: costing.baseSellingPrice * costing.quantity,
      discountAmount: 0,
      taxTotal: costing.gstAmount * costing.quantity,
      grandTotal: costing.grandTotal,
      termsAndConditions: '1. 50% Advance with order.\n2. Delivery within 14 working days.',
      status: 'Sent',
      createdBy: 'Sales System'
    });

    setActiveTab('quotations');
  };

  return (
    <div id="costing-history-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Historical Product Costings</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View saved costing records with fixed rate snapshots applied at calculation time
          </p>
        </div>

        <button
          onClick={() => setActiveTab('calculator')}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" /> New Costing Calculation
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search costing #, product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold px-3 py-2 text-slate-800 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Costings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Costing #</th>
                <th className="p-3.5">Product & Variant</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Batch Qty</th>
                <th className="p-3.5 text-right">Material Cost</th>
                <th className="p-3.5 text-right">Margin %</th>
                <th className="p-3.5 text-right">Selling Price</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCostings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No costing records found.
                  </td>
                </tr>
              ) : (
                filteredCostings.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-amber-600">{c.costingNumber}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{c.productName}</div>
                      <div className="text-[11px] text-slate-500">{c.variantName}</div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-700">{c.category}</td>
                    <td className="p-3.5 text-center font-bold text-slate-800">{c.quantity}</td>
                    <td className="p-3.5 text-right font-mono text-slate-700">
                      {formatCurrency(c.materialCostTotal, currency)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-600">{c.marginPercent}%</td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(c.finalSellingPricePerUnit, currency)}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center space-x-1">
                      <button
                        onClick={() => setSelectedCosting(c)}
                        title="View Detailed Breakdown"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleConvertToQuotation(c)}
                        title="Convert to Quotation"
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg inline-flex items-center"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteCosting(c.id)}
                        title="Delete Costing"
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

      {/* Costing Detail Modal */}
      {selectedCosting && (
        <CostingDetailModal
          costing={selectedCosting}
          onClose={() => setSelectedCosting(null)}
          onConvertToQuotation={handleConvertToQuotation}
        />
      )}
    </div>
  );
};
