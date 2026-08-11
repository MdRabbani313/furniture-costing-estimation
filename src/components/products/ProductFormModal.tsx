import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory } from '../../types';
import { X, Save, Plus, Trash2 } from 'lucide-react';

interface Props {
  productToEdit?: Product;
  onClose: () => void;
}

export const ProductFormModal: React.FC<Props> = ({ productToEdit, onClose }) => {
  const { addProduct, updateProduct, materials } = useApp();

  const [code, setCode] = useState(productToEdit?.code || `PROD-${Date.now().toString().slice(-4)}`);
  const [name, setName] = useState(productToEdit?.name || '');
  const [category, setCategory] = useState<ProductCategory>(productToEdit?.category || 'Box Bed');
  const [description, setDescription] = useState(productToEdit?.description || '');
  const [defaultMarginPercent, setDefaultMarginPercent] = useState(productToEdit?.defaultMarginPercent || 28);
  const [defaultLabourRatePerSqft, setDefaultLabourRatePerSqft] = useState(productToEdit?.defaultLabourRatePerSqft || 65);
  const [status, setStatus] = useState<'Active' | 'Draft' | 'Archived'>(productToEdit?.status || 'Active');

  const [variants, setVariants] = useState(
    productToEdit?.standardVariants || [
      { id: 'v-1', name: 'Standard Variant', dimensions: { width: 72, height: 78, depth: 18, unit: 'inches' }, sqftArea: 80 }
    ]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        code,
        name,
        category,
        description,
        defaultMarginPercent,
        defaultLabourRatePerSqft,
        status,
        standardVariants: variants
      });
    } else {
      addProduct({
        code,
        name,
        category,
        description,
        defaultMarginPercent,
        defaultLabourRatePerSqft,
        status,
        standardVariants: variants,
        costingTemplate: []
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">
            {productToEdit ? `Edit Product: ${productToEdit.name}` : 'Add New Furniture Product Master'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Code</label>
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
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full border border-slate-300 rounded-lg p-2 font-semibold"
              >
                <option value="Box Bed">Box Bed</option>
                <option value="Wardrobe">Wardrobe</option>
                <option value="Office Table">Office Table</option>
                <option value="Study Table">Study Table</option>
                <option value="Dressing Table">Dressing Table</option>
                <option value="Shoe Rack">Shoe Rack</option>
                <option value="TV Unit">TV Unit</option>
                <option value="Deewan">Deewan</option>
                <option value="Mandir">Mandir</option>
                <option value="Custom Furniture">Custom Furniture</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Hydraulic Storage Bed with Cushioned Headboard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Margin %</label>
              <input
                type="number"
                value={defaultMarginPercent}
                onChange={(e) => setDefaultMarginPercent(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded p-1.5 font-bold text-amber-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Default Labour (₹/SQFT)</label>
              <input
                type="number"
                value={defaultLabourRatePerSqft}
                onChange={(e) => setDefaultLabourRatePerSqft(parseFloat(e.target.value) || 0)}
                className="w-full border border-slate-300 rounded p-1.5 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full border border-slate-300 rounded p-1.5 font-semibold"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800">Standard Size Variants</span>
              <button
                type="button"
                onClick={() =>
                  setVariants([
                    ...variants,
                    {
                      id: `v-${Date.now()}`,
                      name: 'New Size Variant',
                      dimensions: { width: 72, height: 78, depth: 18, unit: 'inches' },
                      sqftArea: 75
                    }
                  ])
                }
                className="text-amber-600 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size
              </button>
            </div>

            <div className="space-y-2">
              {variants.map((v, idx) => (
                <div key={v.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) =>
                      setVariants(
                        variants.map((varItem, i) => (i === idx ? { ...varItem, name: e.target.value } : varItem))
                      )
                    }
                    className="w-1/2 border border-slate-300 rounded p-1 font-medium text-xs"
                  />
                  <span className="text-[11px] text-slate-500 font-mono">SQFT:</span>
                  <input
                    type="number"
                    value={v.sqftArea}
                    onChange={(e) =>
                      setVariants(
                        variants.map((varItem, i) =>
                          i === idx ? { ...varItem, sqftArea: parseFloat(e.target.value) || 0 } : varItem
                        )
                      )
                    }
                    className="w-20 border border-slate-300 rounded p-1 font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Product Master
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
