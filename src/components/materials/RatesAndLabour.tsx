import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TrendingUp, ShieldAlert, CheckCircle, Save, History, DollarSign } from 'lucide-react';

export const RatesAndLabour: React.FC = () => {
  const { products, updateProduct, permissions, rateHistory, showToast } = useApp();

  const [labourRates, setLabourRates] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      map[p.id] = p.defaultLabourRatePerSqft;
    });
    return map;
  });

  const handleSaveLabourRates = () => {
    products.forEach((p) => {
      if (labourRates[p.id] !== undefined && labourRates[p.id] !== p.defaultLabourRatePerSqft) {
        updateProduct(p.id, { defaultLabourRatePerSqft: labourRates[p.id] });
      }
    });
    showToast(`Category-wise labour rates updated!`);
  };

  return (
    <div id="rates-and-labour-view" className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Rate & Labour Management Rules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure product/category-wise labour rates, effective dates, wastage factors, and authorization rules
          </p>
        </div>

        {permissions.canEditRates && (
          <button
            onClick={handleSaveLabourRates}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
          >
            <Save className="w-4 h-4" /> Save Updated Labour Rules
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Category & Product Labour Rates Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Product & Category-Wise Labour Rates
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">Product Model</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-right">Current Labour (₹/SQFT)</th>
                  <th className="p-3 text-right">New Effective Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{p.name}</td>
                    <td className="p-3 text-slate-600 font-medium">{p.category}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-700">₹{p.defaultLabourRatePerSqft}</td>
                    <td className="p-3 text-right">
                      <input
                        type="number"
                        disabled={!permissions.canEditRates}
                        value={labourRates[p.id] !== undefined ? labourRates[p.id] : p.defaultLabourRatePerSqft}
                        onChange={(e) =>
                          setLabourRates({ ...labourRates, [p.id]: parseFloat(e.target.value) || 0 })
                        }
                        className="w-24 text-right bg-slate-50 border border-slate-300 rounded px-2 py-1 font-extrabold text-amber-600 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Configurable Costing Rules */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-sm space-y-4 text-xs">
            <h3 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-2">
              Global Costing Calculation Rules
            </h3>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-1">Standard Wastage Factor</span>
                <p className="text-slate-400 text-[11px]">Default +5% added to raw material board cutting loss.</p>
              </div>

              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-1">Historical Rate Lock</span>
                <p className="text-slate-400 text-[11px]">
                  All approved costings retain exact material rates active at time of creation.
                </p>
              </div>

              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <span className="font-bold text-white block mb-1">Margin Override Authorization</span>
                <p className="text-slate-400 text-[11px]">
                  Only Super Admin and Costing Lead roles can adjust target profit margins below default thresholds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
