import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { ProductFormModal } from './ProductFormModal';
import { Search, Plus, Edit2, Trash2, Package, Calculator } from 'lucide-react';

export const ProductList: React.FC = () => {
  const { products, deleteProduct, setActiveTab } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  const categories = ['All', 'Box Bed', 'Wardrobe', 'Office Table', 'Study Table', 'Dressing Table', 'Shoe Rack', 'TV Unit', 'Deewan', 'Mandir'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="products-master-view" className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Products & Categories Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage furniture models, standard dimensions, default profit margins, and component templates
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(undefined);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Product Master
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => (
          <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <span className="bg-slate-100 text-slate-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {p.code}
                </span>
                <h3 className="font-bold text-slate-900 text-base mt-1">{p.name}</h3>
                <p className="text-xs text-amber-600 font-bold mt-0.5">{p.category}</p>
              </div>

              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                {p.status}
              </span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Default Margin</span>
                <span className="font-extrabold text-amber-600 text-sm">{p.defaultMarginPercent}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Labour Rate</span>
                <span className="font-extrabold text-slate-800 text-sm">₹{p.defaultLabourRatePerSqft}/SQFT</span>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-700">Standard Sizes:</span>
              <div className="flex flex-wrap gap-1">
                {p.standardVariants.map((v) => (
                  <span key={v.id} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                    {v.name} ({v.sqftArea} sqft)
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setActiveTab('calculator')}
                className="text-amber-600 font-bold text-xs hover:underline flex items-center gap-1"
              >
                <Calculator className="w-3.5 h-3.5" /> Calculate Costing
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingProduct(p);
                    setShowModal(true);
                  }}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteProduct(p.id)}
                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ProductFormModal
          productToEdit={editingProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};
