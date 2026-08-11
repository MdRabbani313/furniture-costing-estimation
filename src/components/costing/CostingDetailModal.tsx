import React from 'react';
import { CostingRecord } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { X, Printer, FileText, CheckCircle, Calculator } from 'lucide-react';

interface Props {
  costing: CostingRecord;
  onClose: () => void;
  onConvertToQuotation: (costing: CostingRecord) => void;
}

export const CostingDetailModal: React.FC<Props> = ({ costing, onClose, onConvertToQuotation }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded uppercase">
                Approved Costing
              </span>
              <span className="text-amber-400 font-mono font-bold text-sm">{costing.costingNumber}</span>
            </div>
            <h3 className="text-lg font-bold mt-1 text-white">{costing.productName}</h3>
            <p className="text-xs text-slate-400">Variant: {costing.variantName} | SQFT: {costing.sqftTotal}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Category</span>
              <span className="font-bold text-slate-800">{costing.category}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Created On</span>
              <span className="font-bold text-slate-800">{formatDate(costing.createdAt)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Created By</span>
              <span className="font-bold text-slate-800">{costing.createdBy}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Batch Qty</span>
              <span className="font-bold text-slate-800">{costing.quantity} Units</span>
            </div>
          </div>

          {/* Component Material Breakdown Table */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Applied Material & Item Rates Snapshot
            </h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Material Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Applied Rate (₹)</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {costing.components.map((comp) => (
                    <tr key={comp.id}>
                      <td className="p-3 font-medium text-slate-800">{comp.materialName}</td>
                      <td className="p-3 text-slate-500">{comp.category}</td>
                      <td className="p-3 text-right font-mono">{comp.quantity} {comp.unit}</td>
                      <td className="p-3 text-right font-mono">₹{comp.appliedUnitRate}</td>
                      <td className="p-3 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(comp.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Costing Commercial Math Summary */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Total Material Cost:</span>
              <span className="font-mono font-bold">{formatCurrency(costing.materialCostTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Labour Cost ({costing.sqftTotal} SQFT @ ₹{costing.labourRatePerSqft}/sqft):</span>
              <span className="font-mono font-bold">{formatCurrency(costing.labourCostTotal)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Wastage & Contingency ({costing.wastagePercent}%):</span>
              <span className="font-mono font-bold">{formatCurrency(costing.wastageAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-300 font-bold border-t border-slate-800 pt-2">
              <span>Net Subtotal Cost:</span>
              <span className="font-mono">{formatCurrency(costing.subtotalCost)}</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-bold">
              <span>Applied Margin ({costing.marginPercent}%):</span>
              <span className="font-mono">{formatCurrency(costing.marginAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>GST Tax ({costing.gstPercent}%):</span>
              <span className="font-mono">{formatCurrency(costing.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-white font-extrabold text-sm border-t border-slate-700 pt-2">
              <span>Final Selling Price / Unit:</span>
              <span className="font-mono text-amber-400">{formatCurrency(costing.finalSellingPricePerUnit)}</span>
            </div>
          </div>

          {costing.notes && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
              <strong>Notes:</strong> {costing.notes}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onConvertToQuotation(costing);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <FileText className="w-4 h-4" /> Convert to Quotation
          </button>
        </div>
      </div>
    </div>
  );
};
