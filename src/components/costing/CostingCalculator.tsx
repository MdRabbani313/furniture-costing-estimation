import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductVariant, CostingComponentItem, MaterialCategory, MaterialUnit } from '../../types';
import { calculateFurnitureSqft, formatCurrency } from '../../utils/formatters';
import { Calculator, Plus, Trash2, Save, FileText, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

export const CostingCalculator: React.FC = () => {
  const { products, materials, addCosting, currency, permissions, setActiveTab } = useApp();

  // Step 1: Product & Dimension Selection
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [isCustomDimensions, setIsCustomDimensions] = useState<boolean>(false);

  const [customWidth, setCustomWidth] = useState<number>(72);
  const [customHeight, setCustomHeight] = useState<number>(78);
  const [customDepth, setCustomDepth] = useState<number>(18);
  const [customUnit, setCustomUnit] = useState<'inches' | 'mm'>('inches');

  const [batchQuantity, setBatchQuantity] = useState<number>(1);
  const [labourRatePerSqft, setLabourRatePerSqft] = useState<number>(65);
  const [wastagePercent, setWastagePercent] = useState<number>(5);
  const [marginPercent, setMarginPercent] = useState<number>(28);
  const [gstPercent, setGstPercent] = useState<number>(18);
  const [notes, setNotes] = useState<string>('');

  // Selected Components List
  const [components, setComponents] = useState<CostingComponentItem[]>([]);

  // Selected Product object
  const activeProduct = products.find((p) => p.id === selectedProductId);

  // Initialize variant and defaults when activeProduct changes
  useEffect(() => {
    if (activeProduct) {
      setMarginPercent(activeProduct.defaultMarginPercent);
      setLabourRatePerSqft(activeProduct.defaultLabourRatePerSqft);

      if (activeProduct.standardVariants.length > 0 && !isCustomDimensions) {
        const firstVar = activeProduct.standardVariants[0];
        setSelectedVariantId(firstVar.id);
        loadProductTemplateComponents(activeProduct, firstVar.sqftArea);
      } else {
        const sqft = calculateFurnitureSqft(customWidth, customHeight, customDepth, customUnit);
        loadProductTemplateComponents(activeProduct, sqft);
      }
    }
  }, [selectedProductId]);

  // Handle Variant change
  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);
    setIsCustomDimensions(false);
    const variant = activeProduct?.standardVariants.find((v) => v.id === variantId);
    if (variant && activeProduct) {
      loadProductTemplateComponents(activeProduct, variant.sqftArea);
    }
  };

  // Recalculate SQFT when custom dimensions change
  const currentSqft = React.useMemo(() => {
    if (isCustomDimensions) {
      return calculateFurnitureSqft(customWidth, customHeight, customDepth, customUnit);
    }
    const variant = activeProduct?.standardVariants.find((v) => v.id === selectedVariantId);
    return variant ? variant.sqftArea : 80;
  }, [isCustomDimensions, customWidth, customHeight, customDepth, customUnit, activeProduct, selectedVariantId]);

  // Load template components scaled to sqft
  const loadProductTemplateComponents = (prod: Product, sqft: number) => {
    const items: CostingComponentItem[] = prod.costingTemplate.map((tmpl, idx) => {
      const mat = materials.find((m) => m.id === tmpl.materialId);
      const appliedUnitRate = mat ? mat.unitRate : 100;
      const quantity = Math.round(sqft * tmpl.multiplier * 100) / 100 || 1;

      return {
        id: `comp-${Date.now()}-${idx}`,
        materialId: tmpl.materialId,
        materialName: tmpl.materialName,
        category: tmpl.category,
        unit: tmpl.defaultUnit,
        quantity,
        appliedUnitRate,
        totalCost: quantity * appliedUnitRate
      };
    });

    setComponents(items);
  };

  // Add new blank or selected component
  const handleAddComponent = () => {
    if (materials.length === 0) return;
    const defaultMat = materials[0];
    const newComp: CostingComponentItem = {
      id: `comp-${Date.now()}-${Math.random()}`,
      materialId: defaultMat.id,
      materialName: defaultMat.name,
      category: defaultMat.category,
      unit: defaultMat.unit,
      quantity: 1,
      appliedUnitRate: defaultMat.unitRate,
      totalCost: defaultMat.unitRate
    };
    setComponents((prev) => [...prev, newComp]);
  };

  // Update a component line
  const updateComponent = (id: string, updates: Partial<CostingComponentItem>) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          if (updates.materialId && updates.materialId !== c.materialId) {
            const mat = materials.find((m) => m.id === updates.materialId);
            if (mat) {
              updated.materialName = mat.name;
              updated.category = mat.category;
              updated.unit = mat.unit;
              updated.appliedUnitRate = mat.unitRate;
            }
          }
          updated.totalCost = Math.round(updated.quantity * updated.appliedUnitRate * 100) / 100;
          return updated;
        }
        return c;
      })
    );
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  };

  // LIVE CALCULATIONS
  const materialCostTotal = components.reduce((acc, c) => acc + c.totalCost, 0);
  const labourCostTotal = Math.round(currentSqft * labourRatePerSqft);
  const wastageAmount = Math.round(materialCostTotal * (wastagePercent / 100));

  const subtotalCost = materialCostTotal + labourCostTotal + wastageAmount;
  const marginAmount = Math.round(subtotalCost * (marginPercent / 100));
  const baseSellingPrice = subtotalCost + marginAmount;
  const gstAmount = Math.round(baseSellingPrice * (gstPercent / 100));
  const finalSellingPricePerUnit = baseSellingPrice + gstAmount;
  const grandTotal = finalSellingPricePerUnit * batchQuantity;

  // Save Costing
  const handleSaveCosting = () => {
    if (!activeProduct) return;

    const variantObj = activeProduct.standardVariants.find((v) => v.id === selectedVariantId);
    const variantName = isCustomDimensions
      ? `Custom (${customWidth}" x ${customHeight}" x ${customDepth}")`
      : variantObj?.name || 'Standard Variant';

    const savedRecord = addCosting({
      productId: activeProduct.id,
      productName: activeProduct.name,
      category: activeProduct.category,
      variantName,
      customDimensions: isCustomDimensions
        ? { width: customWidth, height: customHeight, depth: customDepth, unit: customUnit }
        : undefined,
      quantity: batchQuantity,
      sqftTotal: currentSqft,
      components,
      materialCostTotal,
      labourRatePerSqft,
      labourCostTotal,
      wastagePercent,
      wastageAmount,
      subtotalCost,
      marginPercent,
      marginAmount,
      baseSellingPrice,
      gstPercent,
      gstAmount,
      finalSellingPricePerUnit,
      grandTotal,
      status: 'Approved',
      createdBy: permissions.canEditMargins ? 'Costing Lead / Admin' : 'Costing User',
      notes
    });

    setActiveTab('costings');
  };

  return (
    <div id="costing-calculator-engine" className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded">
              Core Engine
            </span>
            <h2 className="text-lg font-bold text-slate-900">Automated Product Costing Calculator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated formula-driven calculation: Product → Dimensions → Material Breakdown → Labour → Wastage → Margin → Selling Price
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (activeProduct) loadProductTemplateComponents(activeProduct, currentSqft);
            }}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reload Template Defaults
          </button>
          <button
            id="btn-save-costing"
            onClick={handleSaveCosting}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            Save & Generate Costing Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Specs & Component Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Product & Dimensions */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Select Product & Specify Dimensions
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Category / Item</label>
                <select
                  id="select-costing-product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Variant / Custom Switch */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Size / Variant</label>
                <select
                  id="select-costing-variant"
                  value={isCustomDimensions ? 'custom' : selectedVariantId}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      setIsCustomDimensions(true);
                    } else {
                      handleVariantChange(e.target.value);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {activeProduct?.standardVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} (~{v.sqftArea} sqft)
                    </option>
                  ))}
                  <option value="custom">✏️ Custom Dimensions W x H x D</option>
                </select>
              </div>
            </div>

            {/* Custom Dimension Inputs if selected */}
            {isCustomDimensions && (
              <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200 space-y-3">
                <div className="text-xs font-bold text-amber-900">Custom Dimension Inputs</div>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Width</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Height</label>
                    <input
                      type="number"
                      value={customHeight}
                      onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Depth</label>
                    <input
                      type="number"
                      value={customDepth}
                      onChange={(e) => setCustomDepth(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Unit</label>
                    <select
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                    >
                      <option value="inches">Inches (in)</option>
                      <option value="mm">Millimeters (mm)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Calculated SQFT Surface Info Bar */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Calculated Surface Area (SQFT):</span>
              <span className="font-mono font-bold text-amber-600 text-sm">{currentSqft} SQFT</span>
            </div>
          </div>

          {/* Card 2: Component-Wise Material Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">2. Component Material & Accessories Breakdown</h3>
                <p className="text-xs text-slate-500">Auto-calculated using Material Master rates snapshot</p>
              </div>
              <button
                onClick={handleAddComponent}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Extra Component
              </button>
            </div>

            {/* Components Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2.5">Component / Item</th>
                    <th className="p-2.5 w-24">Unit</th>
                    <th className="p-2.5 w-24 text-right">Quantity</th>
                    <th className="p-2.5 w-28 text-right">Unit Rate (₹)</th>
                    <th className="p-2.5 w-28 text-right">Total (₹)</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {components.map((comp) => (
                    <tr key={comp.id} className="hover:bg-slate-50">
                      <td className="p-2.5">
                        <select
                          value={comp.materialId}
                          onChange={(e) => updateComponent(comp.id, { materialId: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium text-slate-800"
                        >
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.unitRate} / {m.unit})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">{comp.unit}</td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          step="0.1"
                          value={comp.quantity}
                          onChange={(e) => updateComponent(comp.id, { quantity: parseFloat(e.target.value) || 0 })}
                          className="w-20 text-right bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-xs"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <input
                          type="number"
                          value={comp.appliedUnitRate}
                          onChange={(e) => updateComponent(comp.id, { appliedUnitRate: parseFloat(e.target.value) || 0 })}
                          className="w-20 text-right bg-white border border-slate-300 rounded px-2 py-1 font-semibold text-xs"
                        />
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(comp.totalCost, currency)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => removeComponent(comp.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Material Cost Total Summary Row */}
            <div className="flex justify-end pt-2 border-t border-slate-200 text-xs">
              <div className="font-bold text-slate-700">Total Material Cost:</div>
              <div className="font-bold text-slate-900 font-mono ml-4 text-sm">{formatCurrency(materialCostTotal, currency)}</div>
            </div>
          </div>
        </div>

        {/* Right Col: Costing Flow (Labour -> Wastage -> Margin -> Final Selling Price) */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>3. Labour, Margin & Selling Price</span>
              <span className="text-[10px] text-slate-400 font-normal">Automated Flow</span>
            </h3>

            {/* Batch Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Production Quantity</label>
              <input
                type="number"
                min="1"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
              />
            </div>

            {/* Labour Rate Per SQFT */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Labour Rate (₹ / SQFT)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={labourRatePerSqft}
                  onChange={(e) => setLabourRatePerSqft(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                />
                <span className="text-xs text-slate-400 font-mono shrink-0">= {formatCurrency(labourCostTotal, currency)}</span>
              </div>
            </div>

            {/* Wastage Factor % */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Material Wastage Allowance %</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={wastagePercent}
                  onChange={(e) => setWastagePercent(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
                />
                <span className="text-xs text-slate-400 font-mono shrink-0">= {formatCurrency(wastageAmount, currency)}</span>
              </div>
            </div>

            {/* Subtotal Base Cost */}
            <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
              <span className="text-slate-400">Total Net Cost (Mat + Lab + Waste):</span>
              <span className="font-bold font-mono text-slate-200">{formatCurrency(subtotalCost, currency)}</span>
            </div>

            {/* Target Commercial Margin % */}
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold text-amber-300">Target Profit Margin %</label>
                {permissions.canEditMargins ? (
                  <span className="text-[10px] text-emerald-400 font-bold">Authorized Edit</span>
                ) : (
                  <span className="text-[10px] text-rose-400 font-bold">Read Only</span>
                )}
              </div>
              <input
                type="number"
                disabled={!permissions.canEditMargins}
                value={marginPercent}
                onChange={(e) => setMarginPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-xs font-bold text-amber-400 disabled:opacity-60"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Calculated Profit Amount:</span>
                <span className="font-mono font-bold text-amber-400">{formatCurrency(marginAmount, currency)}</span>
              </div>
            </div>

            {/* GST Tax % */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Applicable GST Tax %</label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-bold text-white"
              >
                <option value={18}>18% GST (Standard Furniture)</option>
                <option value={12}>12% GST</option>
                <option value={28}>28% GST</option>
                <option value={0}>0% Tax Exempt</option>
              </select>
            </div>

            {/* FINAL PRICE SUMMARY CARD */}
            <div className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-xl space-y-2 font-semibold shadow-lg">
              <div className="flex justify-between text-xs uppercase tracking-wider text-slate-900 font-extrabold">
                <span>Selling Price / Unit:</span>
                <span className="font-mono text-sm">{formatCurrency(finalSellingPricePerUnit, currency)}</span>
              </div>

              <div className="border-t border-slate-950/20 pt-2 flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase">Grand Total ({batchQuantity} units):</span>
                <span className="text-lg font-black font-mono">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Costing Notes / Remarks</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Specific client customizations or site instructions..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
