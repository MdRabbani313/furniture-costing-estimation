import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnitMasterItem, UnitCategory } from '../../types';
import { 
  Ruler, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Check, 
  X, 
  Calculator, 
  Layers, 
  ArrowRightLeft,
  Sparkles,
  HelpCircle
} from 'lucide-react';

const CATEGORIES: UnitCategory[] = ['Area', 'Length', 'Volume', 'Weight', 'Count', 'Sheet'];

export const UnitMaster: React.FC = () => {
  const { units, addUnit, updateUnit, deleteUnit, permissions, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<UnitMasterItem, 'id'>>({
    code: '',
    name: '',
    symbol: '',
    category: 'Area',
    baseConversionFactor: 1,
    isDefault: false,
    description: ''
  });

  // Test Conversion Tool State
  const [convValue, setConvValue] = useState<number>(100);
  const [fromUnitCode, setFromUnitCode] = useState<string>('SQFT');
  const [toUnitCode, setToUnitCode] = useState<string>('SQM');

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || u.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingUnitId(null);
    setFormData({
      code: '',
      name: '',
      symbol: '',
      category: 'Area',
      baseConversionFactor: 1,
      isDefault: false,
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: UnitMasterItem) => {
    setEditingUnitId(unit.id);
    setFormData({
      code: unit.code,
      name: unit.name,
      symbol: unit.symbol,
      category: unit.category,
      baseConversionFactor: unit.baseConversionFactor,
      isDefault: !!unit.isDefault,
      description: unit.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      showToast('Unit Code and Name are required', 'error');
      return;
    }

    if (editingUnitId) {
      updateUnit(editingUnitId, formData);
    } else {
      addUnit(formData);
    }
    setIsModalOpen(false);
  };

  // Convert calculation
  const fromUnit = units.find((u) => u.code === fromUnitCode);
  const toUnit = units.find((u) => u.code === toUnitCode);
  let convertedResult: number | null = null;
  if (fromUnit && toUnit) {
    if (fromUnit.category === toUnit.category) {
      // (Value * fromFactor) / toFactor
      convertedResult = (convValue * fromUnit.baseConversionFactor) / toUnit.baseConversionFactor;
    }
  }

  return (
    <div className="space-y-6" id="unit-master-container">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Ruler className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Unit of Measurement Master</h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Arbuda Steel Industries standard measurement master. Manage custom units across Area, Length, Volume, Weight, Count, and Sheets with dynamic base conversion factors.
          </p>
        </div>

        {permissions.canEditMaterials && (
          <button
            id="btn-add-unit"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Unit</span>
          </button>
        )}
      </div>

      {/* Quick Interactive Conversion Bar */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-slate-100 border border-amber-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
            <Calculator className="w-4 h-4 text-amber-700" />
            <span>Live Master Unit Conversion Calculator</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Input:</span>
              <input
                type="number"
                value={convValue}
                onChange={(e) => setConvValue(parseFloat(e.target.value) || 0)}
                className="w-20 text-sm font-semibold text-slate-900 focus:outline-none"
              />
              <select
                value={fromUnitCode}
                onChange={(e) => setFromUnitCode(e.target.value)}
                className="text-xs font-semibold text-amber-700 bg-amber-50 rounded px-1.5 py-1 focus:outline-none"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.code}>
                    {u.code} ({u.category})
                  </option>
                ))}
              </select>
            </div>

            <ArrowRightLeft className="w-4 h-4 text-slate-400" />

            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Target:</span>
              <select
                value={toUnitCode}
                onChange={(e) => setToUnitCode(e.target.value)}
                className="text-xs font-semibold text-amber-700 bg-amber-50 rounded px-1.5 py-1 focus:outline-none"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.code}>
                    {u.code} ({u.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-amber-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm">
              {convertedResult !== null
                ? `${convertedResult.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${toUnit?.symbol || toUnitCode}`
                : 'Incompatible Categories'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by unit code, name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Units ({units.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = units.filter((u) => u.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Unit Master Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm" id="units-table">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Unit Code</th>
                <th className="px-5 py-3.5">Full Name</th>
                <th className="px-5 py-3.5">Symbol</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5 text-right">Base Conversion Factor</th>
                <th className="px-5 py-3.5">Default</th>
                <th className="px-5 py-3.5">Description</th>
                {permissions.canEditMaterials && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUnits.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md font-mono text-xs">
                      {unit.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{unit.name}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{unit.symbol}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        unit.category === 'Area'
                          ? 'bg-blue-100 text-blue-800'
                          : unit.category === 'Length'
                          ? 'bg-purple-100 text-purple-800'
                          : unit.category === 'Sheet'
                          ? 'bg-amber-100 text-amber-800'
                          : unit.category === 'Count'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {unit.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-900">
                    {unit.baseConversionFactor}
                  </td>
                  <td className="px-5 py-3.5">
                    {unit.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" /> Core
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-500 max-w-xs truncate">
                    {unit.description || '-'}
                  </td>
                  {permissions.canEditMaterials && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(unit)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title="Edit Unit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!unit.isDefault && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove unit ${unit.code}?`)) {
                                deleteUnit(unit.id);
                              }
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Unit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredUnits.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-sm text-slate-500">
                    No units matching the criteria found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Unit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingUnitId ? 'Edit Measurement Unit' : 'Create New Unit Master'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Unit Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SQFT, MM, RFT"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. sq.ft, mm, r.ft"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Square Feet, Running Feet"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as UnitCategory })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Base Conversion Factor *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.baseConversionFactor}
                    onChange={(e) =>
                      setFormData({ ...formData, baseConversionFactor: parseFloat(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Description / Note
                </label>
                <textarea
                  rows={2}
                  placeholder="Usage instructions or board conversions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-default"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500 h-4 w-4"
                />
                <label htmlFor="chk-default" className="text-xs text-slate-700 font-medium">
                  Set as core default unit
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  {editingUnitId ? 'Update Unit' : 'Save Unit to Master'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
