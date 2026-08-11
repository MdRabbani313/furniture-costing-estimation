import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialItem, MaterialCategory } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MaterialFormModal } from './MaterialFormModal';
import { RateHistoryModal } from './RateHistoryModal';
import { Search, Plus, Edit2, Trash2, History, Layers, Filter } from 'lucide-react';

export const MaterialMaster: React.FC = () => {
  const { materials, deleteMaterial, permissions, currency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const categories = [
    'All',
    'Plywood',
    'Handles & Knobs',
    'Hinges & Channels',
    'Locks & Fittings',
    'PVC Patti',
    'Glass & Mirror',
    'Hydraulic & Cushion',
    'LED & Electrical',
    'SS Pipe & Legs',
    'Bed Socket & Hardware',
    'Other Accessories'
  ];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="material-master-view" className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Material & Item Rates Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized management of costing components (Plywood, Fittings, Handles, Glass, Hydraulic, LED)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <History className="w-4 h-4 text-amber-600" />
            Rate Audit History
          </button>

          {permissions.canEditMaterials && (
            <button
              onClick={() => {
                setEditingMaterial(undefined);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add New Material
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search material code or spec..."
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Material Specification</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5 text-center">Unit</th>
                <th className="p-3.5 text-right">Unit Rate (₹)</th>
                <th className="p-3.5 text-right">GST %</th>
                <th className="p-3.5">Last Updated</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-slate-700">{m.code}</td>
                  <td className="p-3.5 font-bold text-slate-900">{m.name}</td>
                  <td className="p-3.5 font-medium text-amber-700">{m.category}</td>
                  <td className="p-3.5 text-center font-bold text-slate-800">{m.unit}</td>
                  <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 text-sm">
                    {formatCurrency(m.unitRate, currency)}
                  </td>
                  <td className="p-3.5 text-right font-mono text-slate-600">{m.gstRate}%</td>
                  <td className="p-3.5 text-slate-500 text-[11px] font-mono">{formatDate(m.lastUpdated)}</td>
                  <td className="p-3.5 text-center space-x-1">
                    {permissions.canEditRates && (
                      <button
                        onClick={() => {
                          setEditingMaterial(m);
                          setShowModal(true);
                        }}
                        title="Edit Material & Rate"
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg inline-flex items-center"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {permissions.canEditMaterials && (
                      <button
                        onClick={() => deleteMaterial(m.id)}
                        title="Delete Material"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <MaterialFormModal
          materialToEdit={editingMaterial}
          onClose={() => setShowModal(false)}
        />
      )}

      {showHistoryModal && <RateHistoryModal onClose={() => setShowHistoryModal(false)} />}
    </div>
  );
};
