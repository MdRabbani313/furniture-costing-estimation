import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../utils/formatters';
import { X, TrendingUp, History } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const RateHistoryModal: React.FC<Props> = ({ onClose }) => {
  const { rateHistory } = useApp();

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Material Rate Revision Audit Trail</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
          <p className="text-slate-500">
            Historical record of all material rate modifications. Past costings retain rates applicable at the time of calculation.
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Effective Date</th>
                  <th className="p-3">Material Item</th>
                  <th className="p-3 text-right">Old Rate</th>
                  <th className="p-3 text-right">New Rate</th>
                  <th className="p-3">Modified By</th>
                  <th className="p-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rateHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No rate revisions recorded yet.
                    </td>
                  </tr>
                ) : (
                  rateHistory.map((rh) => (
                    <tr key={rh.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-medium text-slate-600">{formatDate(rh.effectiveDate)}</td>
                      <td className="p-3 font-bold text-slate-900">{rh.materialName}</td>
                      <td className="p-3 text-right font-mono text-slate-500 line-through">₹{rh.oldRate}</td>
                      <td className="p-3 text-right font-mono font-bold text-amber-600">₹{rh.newRate}</td>
                      <td className="p-3 text-slate-700 font-medium">{rh.changedBy}</td>
                      <td className="p-3 text-slate-500 italic">{rh.reason || 'Rate update'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
