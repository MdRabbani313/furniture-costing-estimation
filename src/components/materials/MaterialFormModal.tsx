import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaterialItem, MaterialCategory, MaterialUnit } from '../../types';
import { X, Save } from 'lucide-react';

interface Props {
  materialToEdit?: MaterialItem;
  onClose: () => void;
}

export const MaterialFormModal: React.FC<Props> = ({ materialToEdit, onClose }) => {
  const { addMaterial, updateMaterial } = useApp();

  const [code, setCode] = useState(materialToEdit?.code || `MAT-${Date.now().toString().slice(-4)}`);
  const [name, setName] = useState(materialToEdit?.name || '');
  const [category, setCategory] = useState<MaterialCategory>(materialToEdit?.category || 'Plywood');
  const [unit, setUnit] = useState<MaterialUnit>(materialToEdit?.unit || 'SQFT');
  const [unitRate, setUnitRate] = useState(materialToEdit?.unitRate || 100);
  const [gstRate, setGstRate] = useState(materialToEdit?.gstRate || 18);
  const [status, setStatus] = useState<'Active' | 'Discontinued'>(materialToEdit?.status || 'Active');
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (materialToEdit) {
      updateMaterial(materialToEdit.id, {
        code,
        name,
        category,
        unit,
        unitRate,
        gstRate,
        status
      }, reason);
    } else {
      addMaterial({
        code,
        name,
        category,
        unit,
        unitRate,
        gstRate,
        status
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {materialToEdit ? `Update Rate / Material: ${materialToEdit.name}` : 'Add New Material Item Master'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Item Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
              >
                <option value="Plywood">Plywood</option>
                <option value="Handles & Knobs">Handles & Knobs</option>
                <option value="Hinges & Channels">Hinges & Channels</option>
                <option value="Locks & Fittings">Locks & Fittings</option>
                <option value="PVC Patti">PVC Patti</option>
                <option value="Glass & Mirror">Glass & Mirror</option>
                <option value="Hydraulic & Cushion">Hydraulic & Cushion</option>
                <option value="LED & Electrical">LED & Electrical</option>
                <option value="SS Pipe & Legs">SS Pipe & Legs</option>
                <option value="Bed Socket & Hardware">Bed Socket & Hardware</option>
                <option value="Other Accessories">Other Accessories</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Material Name & Spec</label>
            <input
              type="text"
              required
              placeholder="e.g. 18mm BWR Commercial Plywood (Gurjan Core)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold"
              >
                <option value="SQFT">SQFT</option>
                <option value="Piece">Piece</option>
                <option value="Pair">Pair</option>
                <option value="Feet">Feet</option>
                <option value="Meter">Meter</option>
                <option value="Set">Set</option>
                <option value="Roll">Roll</option>
                <option value="KG">KG</option>
                <option value="Box">Box</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Rate (₹)</label>
              <input
                type="number"
                required
                step="0.1"
                value={unitRate}
                onChange={(e) => setUnitRate(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold text-amber-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">GST %</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded-lg p-2 font-bold"
              />
            </div>
          </div>

          {materialToEdit && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rate Adjustment Reason / Remarks</label>
              <input
                type="text"
                placeholder="e.g. Price hike by raw timber supplier"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-xs"
              />
            </div>
          )}

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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Material Rate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
