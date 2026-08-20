import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CutListPanel, CutListStock, CutListOptions, CutListResult } from '../../types';
import { optimizeCutList } from '../../utils/cutlistOptimizer';
import {
  Scissors,
  Layers,
  Plus,
  Trash2,
  Play,
  RotateCw,
  Printer,
  Download,
  Sparkles,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Settings2,
  RefreshCw,
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const DEFAULT_PANELS: CutListPanel[] = [
  { id: 'p1', name: 'PLANK-1 TOP', length: 30, width: 20, quantity: 2, material: '18mm PLB', canRotate: true, edgeBending: { top: true, bottom: true, left: true, right: true }, color: '#3b82f6' },
  { id: 'p2', name: 'PLANK-2 SIDE L', length: 78, width: 20, quantity: 2, material: '18mm PLB', canRotate: true, edgeBending: { top: false, bottom: true, left: true, right: true }, color: '#10b981' },
  { id: 'p3', name: 'PLANK-3 SHELF', length: 28.5, width: 19.5, quantity: 4, material: '18mm PLB', canRotate: true, edgeBending: { top: false, bottom: false, left: true, right: false }, color: '#f59e0b' },
  { id: 'p4', name: 'PLANK-4 DOOR', length: 72, width: 14.5, quantity: 2, material: '18mm PLB', canRotate: true, edgeBending: { top: true, bottom: true, left: true, right: true }, color: '#8b5cf6' },
  { id: 'p5', name: 'PLANK-5 DRAWER FRONT', length: 28, width: 8, quantity: 3, material: '18mm PLB', canRotate: true, edgeBending: { top: true, bottom: true, left: true, right: true }, color: '#ec4899' },
  { id: 'p6', name: 'PLANK-6 SKIRTING', length: 30, width: 4, quantity: 2, material: '18mm PLB', canRotate: true, edgeBending: { top: false, bottom: false, left: false, right: false }, color: '#06b6d4' }
];

const DEFAULT_STOCKS: CutListStock[] = [
  { id: 's1', name: '8x4 Standard Commercial Sheet', length: 96, width: 48, quantity: 10, material: '18mm PLB', costPerSheet: 1500 },
  { id: 's2', name: '7x4 Sheet', length: 84, width: 48, quantity: 5, material: '18mm PLB', costPerSheet: 1300 }
];

export const CutListOptimizerView: React.FC = () => {
  const { cutListTransferPlanks, setCutListTransferPlanks, currency, showToast } = useApp();

  const [panels, setPanels] = useState<CutListPanel[]>(DEFAULT_PANELS);
  const [stocks, setStocks] = useState<CutListStock[]>(DEFAULT_STOCKS);
  const [options, setOptions] = useState<CutListOptions>({
    kerfThickness: 0.125, // 1/8" = 3.175mm
    trimMargin: 0.25,     // 1/4" edge trim
    allowRotation: true,
    cutPreference: 'minimal_waste',
    unit: 'inches'
  });

  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [result, setResult] = useState<CutListResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  // If planks were passed from Costing Sheet Master
  useEffect(() => {
    if (cutListTransferPlanks && cutListTransferPlanks.length > 0) {
      setPanels(cutListTransferPlanks);
      setCutListTransferPlanks(null);
      // Auto run optimization
      setTimeout(() => {
        handleRunOptimization(cutListTransferPlanks, stocks, options);
      }, 100);
    } else if (!result) {
      handleRunOptimization(panels, stocks, options);
    }
  }, [cutListTransferPlanks]);

  const handleRunOptimization = (
    panelsToOpt = panels,
    stocksToOpt = stocks,
    optsToOpt = options
  ) => {
    setIsOptimizing(true);
    setTimeout(() => {
      try {
        const res = optimizeCutList(panelsToOpt, stocksToOpt, optsToOpt);
        setResult(res);
        setActiveSheetIndex(0);
        showToast(`Optimization complete! Packed into ${res.totalStockSheetsUsed} sheets with ${res.overallEfficiencyPercent}% efficiency.`);
      } catch (err) {
        showToast('Error during optimization calculation', 'error');
      } finally {
        setIsOptimizing(false);
      }
    }, 150);
  };

  // Panel Management
  const handleAddPanel = () => {
    const newPanel: CutListPanel = {
      id: `p-${Date.now()}`,
      name: `Panel ${panels.length + 1}`,
      length: 30,
      width: 18,
      quantity: 1,
      material: '18mm PLB',
      canRotate: true,
      edgeBending: { top: false, bottom: false, left: false, right: false },
      color: '#3b82f6'
    };
    setPanels([...panels, newPanel]);
  };

  const handleUpdatePanel = (id: string, updates: Partial<CutListPanel>) => {
    setPanels(panels.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleDeletePanel = (id: string) => {
    setPanels(panels.filter((p) => p.id !== id));
  };

  // Stock Management
  const handleAddStock = () => {
    const newStock: CutListStock = {
      id: `s-${Date.now()}`,
      name: 'Standard 8x4 Sheet',
      length: 96,
      width: 48,
      quantity: 5,
      material: '18mm PLB',
      costPerSheet: 1500
    };
    setStocks([...stocks, newStock]);
  };

  const handleUpdateStock = (id: string, updates: Partial<CutListStock>) => {
    setStocks(stocks.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteStock = (id: string) => {
    setStocks(stocks.filter((s) => s.id !== id));
  };

  const activeSheet = result?.sheetLayouts[activeSheetIndex];

  return (
    <div className="space-y-6" id="cutlist-optimizer-container">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-blue-50 text-blue-700 rounded-lg">
              <Scissors className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              2D CutList Sheet Optimizer
            </h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            High-efficiency 2D guillotine cutting stock optimizer for Arbuda Steel Industries. Minimizes sheet waste, computes kerf sawblade deductions, and visualizes edge-banding and cut sequences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-optimize-run"
            onClick={() => handleRunOptimization()}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Calculate CutList</span>
          </button>
        </div>
      </div>

      {/* Cutting Settings Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
            <Settings2 className="w-4 h-4 text-blue-600" />
            <span>Saw & Sheet Parameters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700">
            {/* Kerf */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500">Saw Blade Kerf:</span>
              <input
                type="number"
                step="0.01"
                value={options.kerfThickness}
                onChange={(e) =>
                  setOptions({ ...options, kerfThickness: parseFloat(e.target.value) || 0 })
                }
                className="w-14 px-1 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-400">in</span>
            </div>

            {/* Trim Margin */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500">Sheet Trim Margin:</span>
              <input
                type="number"
                step="0.01"
                value={options.trimMargin}
                onChange={(e) =>
                  setOptions({ ...options, trimMargin: parseFloat(e.target.value) || 0 })
                }
                className="w-14 px-1 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded font-mono"
              />
              <span className="text-slate-400">in</span>
            </div>

            {/* Allow Rotation */}
            <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={options.allowRotation}
                onChange={(e) => setOptions({ ...options, allowRotation: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span>Allow Grain / Panel Rotation</span>
            </label>

            {/* Cut Preference */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="text-slate-500">Cut Style:</span>
              <select
                value={options.cutPreference}
                onChange={(e) =>
                  setOptions({ ...options, cutPreference: e.target.value as CutListOptions['cutPreference'] })
                }
                className="text-xs font-bold bg-white border border-slate-300 rounded px-2 py-0.5"
              >
                <option value="minimal_waste">Minimal Waste (Best Area Fit)</option>
                <option value="guillotine_length">Guillotine Length-Wise</option>
                <option value="guillotine_width">Guillotine Width-Wise</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Inputs Grid: Panels & Stock Sheets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panels / Cut Pieces (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">
                Panels To Cut ({panels.reduce((sum, p) => sum + p.quantity, 0)} Total Pcs)
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddPanel}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Panel</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[380px] p-2">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-500 uppercase bg-slate-100/70 border-b border-slate-200">
                <tr>
                  <th className="px-2 py-2 w-8">#</th>
                  <th className="px-2 py-2">Label / Name</th>
                  <th className="px-2 py-2 text-center w-14">L (in)</th>
                  <th className="px-2 py-2 text-center w-14">W (in)</th>
                  <th className="px-2 py-2 text-center w-12">Qty</th>
                  <th className="px-2 py-2 text-center w-14">Rotate</th>
                  <th className="px-2 py-2 text-center w-28">Edge Band (T/B/L/R)</th>
                  <th className="px-2 py-2 w-8 text-center">Color</th>
                  <th className="px-2 py-2 w-8 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {panels.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-2 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                    <td className="px-2 py-2">
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => handleUpdatePanel(p.id, { name: e.target.value })}
                        className="w-full px-2 py-1 font-semibold text-slate-900 border border-transparent hover:border-slate-300 focus:border-blue-500 rounded text-xs"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={p.length}
                        onChange={(e) =>
                          handleUpdatePanel(p.id, { length: parseFloat(e.target.value) || 0 })
                        }
                        className="w-14 text-center font-bold font-mono px-1 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <input
                        type="number"
                        step="0.1"
                        value={p.width}
                        onChange={(e) =>
                          handleUpdatePanel(p.id, { width: parseFloat(e.target.value) || 0 })
                        }
                        className="w-14 text-center font-bold font-mono px-1 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <input
                        type="number"
                        value={p.quantity}
                        onChange={(e) =>
                          handleUpdatePanel(p.id, { quantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-12 text-center font-bold font-mono px-1 py-1 border border-slate-200 rounded text-xs text-blue-700 bg-blue-50/40"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={p.canRotate !== false}
                        onChange={(e) => handleUpdatePanel(p.id, { canRotate: e.target.checked })}
                        className="rounded text-blue-600 h-3.5 w-3.5"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 font-mono text-[10px]">
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePanel(p.id, {
                              edgeBending: { ...p.edgeBending, top: !p.edgeBending.top }
                            })
                          }
                          className={`w-5 h-5 rounded font-bold border transition-colors ${
                            p.edgeBending.top
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title="Top Edge Band"
                        >
                          T
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePanel(p.id, {
                              edgeBending: { ...p.edgeBending, bottom: !p.edgeBending.bottom }
                            })
                          }
                          className={`w-5 h-5 rounded font-bold border transition-colors ${
                            p.edgeBending.bottom
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title="Bottom Edge Band"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePanel(p.id, {
                              edgeBending: { ...p.edgeBending, left: !p.edgeBending.left }
                            })
                          }
                          className={`w-5 h-5 rounded font-bold border transition-colors ${
                            p.edgeBending.left
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title="Left Edge Band"
                        >
                          L
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdatePanel(p.id, {
                              edgeBending: { ...p.edgeBending, right: !p.edgeBending.right }
                            })
                          }
                          className={`w-5 h-5 rounded font-bold border transition-colors ${
                            p.edgeBending.right
                              ? 'bg-purple-600 text-white border-purple-700'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                          title="Right Edge Band"
                        >
                          R
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="color"
                        value={p.color || '#3b82f6'}
                        onChange={(e) => handleUpdatePanel(p.id, { color: e.target.value })}
                        className="w-5 h-5 rounded border-0 cursor-pointer p-0"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => handleDeletePanel(p.id)}
                        className="text-slate-400 hover:text-red-600"
                        title="Delete panel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stock Sheets Available (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Stock Sheets Inventory</h3>
            </div>
            <button
              onClick={handleAddStock}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stock</span>
            </button>
          </div>

          <div className="overflow-x-auto max-h-[380px] p-2">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-500 uppercase bg-slate-100/70 border-b border-slate-200">
                <tr>
                  <th className="px-2 py-2">Stock Name</th>
                  <th className="px-2 py-2 text-center w-14">L (in)</th>
                  <th className="px-2 py-2 text-center w-14">W (in)</th>
                  <th className="px-2 py-2 text-center w-12">Qty</th>
                  <th className="px-2 py-2 text-right w-16">Price ₹</th>
                  <th className="px-2 py-2 w-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stocks.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-2 font-semibold text-slate-900">
                      <input
                        type="text"
                        value={s.name}
                        onChange={(e) => handleUpdateStock(s.id, { name: e.target.value })}
                        className="w-full px-1.5 py-0.5 border border-transparent hover:border-slate-300 focus:border-emerald-500 rounded text-xs font-medium"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <input
                        type="number"
                        value={s.length}
                        onChange={(e) =>
                          handleUpdateStock(s.id, { length: parseFloat(e.target.value) || 0 })
                        }
                        className="w-14 text-center font-bold font-mono px-1 py-0.5 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <input
                        type="number"
                        value={s.width}
                        onChange={(e) =>
                          handleUpdateStock(s.id, { width: parseFloat(e.target.value) || 0 })
                        }
                        className="w-14 text-center font-bold font-mono px-1 py-0.5 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <input
                        type="number"
                        value={s.quantity}
                        onChange={(e) =>
                          handleUpdateStock(s.id, { quantity: parseInt(e.target.value) || 1 })
                        }
                        className="w-12 text-center font-bold font-mono px-1 py-0.5 border border-slate-200 rounded text-xs text-emerald-700 bg-emerald-50/40"
                      />
                    </td>
                    <td className="px-1 py-2 text-right">
                      <input
                        type="number"
                        value={s.costPerSheet || 0}
                        onChange={(e) =>
                          handleUpdateStock(s.id, { costPerSheet: parseFloat(e.target.value) || 0 })
                        }
                        className="w-16 text-right font-bold font-mono px-1 py-0.5 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="px-1 py-2 text-center">
                      <button
                        onClick={() => handleDeleteStock(s.id)}
                        className="text-slate-400 hover:text-red-600"
                        title="Delete stock"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Sheets Required</div>
              <div className="text-2xl font-extrabold text-blue-600 font-mono mt-1">
                {result.totalStockSheetsUsed} <span className="text-xs font-normal text-slate-400">boards</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Packing Efficiency</div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
                {result.overallEfficiencyPercent}%
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Used Area</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                {result.totalUsedAreaSqft} <span className="text-xs text-slate-400">sq.ft</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Waste / Offcut Area</div>
              <div className="text-xl font-bold text-amber-600 font-mono mt-1">
                {result.totalWasteAreaSqft} <span className="text-xs text-slate-400">sq.ft</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Total Cuts Count</div>
              <div className="text-xl font-bold text-purple-600 font-mono mt-1">
                {result.totalCutsCount} <span className="text-xs text-slate-400">cuts</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Estimated Board Cost</div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                ₹{result.totalSheetCost.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Unplaced Panels Warning if any */}
          {result.unplacedPanels.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <strong>Warning:</strong> {result.unplacedPanels.reduce((s, p) => s + p.count, 0)} panel(s) could not fit within the available stock sheets. Add more sheets to pack completely.
              </div>
            </div>
          )}

          {/* Sheet Layout Canvas & Visualizer */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Sheet Tabs */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Sheet Layout:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {result.sheetLayouts.map((sheet, sIdx) => (
                    <button
                      key={sheet.sheetIndex}
                      onClick={() => setActiveSheetIndex(sIdx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        activeSheetIndex === sIdx
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Sheet {sheet.sheetIndex} ({sheet.efficiencyPercent}%)
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Cutting Diagram</span>
                </button>
              </div>
            </div>

            {/* Visual SVG Diagram for Active Sheet */}
            {activeSheet && (
              <div className="p-6 bg-slate-900 overflow-x-auto flex flex-col items-center">
                {/* Sheet Dimensions Header */}
                <div className="text-xs text-slate-400 font-mono mb-3 flex items-center gap-4">
                  <span>
                    Stock: <strong className="text-white">{activeSheet.stockSheet.name}</strong> ({activeSheet.stockSheet.length}" × {activeSheet.stockSheet.width}")
                  </span>
                  <span>|</span>
                  <span>
                    Placed Panels: <strong className="text-blue-400">{activeSheet.placedPanels.length}</strong>
                  </span>
                  <span>|</span>
                  <span>
                    Efficiency: <strong className="text-emerald-400">{activeSheet.efficiencyPercent}%</strong>
                  </span>
                </div>

                {/* SVG 2D Viewport */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-2xl inline-block max-w-full">
                  <svg
                    viewBox={`0 0 ${activeSheet.stockSheet.length * 10} ${activeSheet.stockSheet.width * 10}`}
                    className="w-full max-w-[900px] h-auto border-2 border-slate-600 bg-slate-900 shadow-inner rounded"
                    style={{ minHeight: '380px' }}
                  >
                    {/* Defs for hatching patterns on waste zones */}
                    <defs>
                      <pattern id="wastePattern" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="2" />
                      </pattern>
                    </defs>

                    {/* Stock Sheet Base Outer Outline */}
                    <rect
                      x="0"
                      y="0"
                      width={activeSheet.stockSheet.length * 10}
                      height={activeSheet.stockSheet.width * 10}
                      fill="#1e293b"
                    />

                    {/* Waste / Offcut Rectangles with Hatching */}
                    {activeSheet.wasteRectangles.map((w, wIdx) => (
                      <g key={`waste-${wIdx}`}>
                        <rect
                          x={w.x * 10}
                          y={w.y * 10}
                          width={w.length * 10}
                          height={w.width * 10}
                          fill="url(#wastePattern)"
                          stroke="#64748b"
                          strokeWidth="1"
                          strokeDasharray="4 2"
                        />
                        {w.length > 8 && w.width > 6 && (
                          <text
                            x={(w.x + w.length / 2) * 10}
                            y={(w.y + w.width / 2) * 10}
                            fill="#94a3b8"
                            fontSize="14"
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontFamily="monospace"
                          >
                            Waste: {w.length}" × {w.width}"
                          </text>
                        )}
                      </g>
                    ))}

                    {/* Placed Panels */}
                    {activeSheet.placedPanels.map((p, pIdx) => {
                      const px = p.x * 10;
                      const py = p.y * 10;
                      const pw = p.length * 10;
                      const ph = p.width * 10;

                      return (
                        <g key={`panel-${pIdx}`} className="cursor-pointer group">
                          {/* Panel Background */}
                          <rect
                            x={px}
                            y={py}
                            width={pw}
                            height={ph}
                            fill={p.color || '#3b82f6'}
                            stroke="#0f172a"
                            strokeWidth="2"
                            rx="2"
                            className="transition-all hover:brightness-110"
                          />

                          {/* Edge Bending Highlights (Thick Purple Lines) */}
                          {p.edgeBending?.top && (
                            <line x1={px} y1={py} x2={px + pw} y2={py} stroke="#d946ef" strokeWidth="6" />
                          )}
                          {p.edgeBending?.bottom && (
                            <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke="#d946ef" strokeWidth="6" />
                          )}
                          {p.edgeBending?.left && (
                            <line x1={px} y1={py} x2={px} y2={py + ph} stroke="#d946ef" strokeWidth="6" />
                          )}
                          {p.edgeBending?.right && (
                            <line x1={px + pw} y1={py} x2={px + pw} y2={py + ph} stroke="#d946ef" strokeWidth="6" />
                          )}

                          {/* Text Labels */}
                          {pw > 60 && ph > 35 && (
                            <>
                              <text
                                x={px + pw / 2}
                                y={py + ph / 2 - 8}
                                fill="#ffffff"
                                fontSize="14"
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontFamily="sans-serif"
                              >
                                {p.name}
                              </text>
                              <text
                                x={px + pw / 2}
                                y={py + ph / 2 + 10}
                                fill="#f1f5f9"
                                fontSize="12"
                                fontWeight="600"
                                textAnchor="middle"
                                dominantBaseline="central"
                                fontFamily="monospace"
                              >
                                {p.length}" × {p.width}" {p.rotated ? '↻' : ''}
                              </text>
                            </>
                          )}
                        </g>
                      );
                    })}

                    {/* Guillotine Cut Lines with Sequence Badges */}
                    {activeSheet.cutLines.map((c, cIdx) => (
                      <g key={`cut-${cIdx}`}>
                        <line
                          x1={c.x1 * 10}
                          y1={c.y1 * 10}
                          x2={c.x2 * 10}
                          y2={c.y2 * 10}
                          stroke="#fbbf24"
                          strokeWidth="2"
                          strokeDasharray="5 3"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Legend & Instructions */}
                <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 bg-blue-500 rounded border border-slate-700"></span>
                    <span>Placed Panels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 bg-slate-700 rounded border border-slate-500" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #475569, #475569 2px, transparent 2px, transparent 4px)' }}></span>
                    <span>Usable Waste / Offcut</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1 bg-amber-400"></span>
                    <span>Guillotine Saw Blade Cut Line</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-1.5 bg-purple-500 rounded"></span>
                    <span>Edge Bending Side</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
