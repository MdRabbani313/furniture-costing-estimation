import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BoardRateMaster } from '../../types';
import {
  Clock,
  Scissors,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Sparkles,
  Layers,
  TrendingUp,
  Save,
  Calculator
} from 'lucide-react';

export const ManufacturingRatesMaster: React.FC = () => {
  const {
    manufacturingRates,
    updateManufacturingRates,
    addBoardRate,
    updateBoardRate,
    deleteBoardRate,
    permissions,
    showToast
  } = useApp();

  const [ratesForm, setRatesForm] = useState({
    cuttingRatePerMin: manufacturingRates.cuttingRatePerMin,
    labourRatePerMin: manufacturingRates.labourRatePerMin,
    edgeBendingRatePerInch: manufacturingRates.edgeBendingRatePerInch,
    dailyLabourWage: manufacturingRates.dailyLabourWage,
    workingHoursPerDay: manufacturingRates.workingHoursPerDay,
    dailyMachineCost: manufacturingRates.dailyMachineCost,
    boardWastagePercent: manufacturingRates.boardWastagePercent,
    defaultGstPercent: manufacturingRates.defaultGstPercent
  });

  // Auto-calculated labour rate per minute per person
  const calculatedLabourPerMin = Number(
    (ratesForm.dailyLabourWage / (Math.max(1, ratesForm.workingHoursPerDay) * 60)).toFixed(2)
  );

  // Board Modal state
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardForm, setBoardForm] = useState<Omit<BoardRateMaster, 'id'>>({
    name: '',
    ratePerSqft: 90,
    thicknessMm: 18,
    grade: 'Commercial HMR'
  });

  // Interactive Live Simulator State
  const [simWidth, setSimWidth] = useState(20);
  const [simLength, setSimLength] = useState(30);
  const [simQty, setSimQty] = useState(2);
  const [simBoardRate, setSimBoardRate] = useState(33);
  const [simCutTime, setSimCutTime] = useState(0.833);
  const [simEBInches, setSimEBInches] = useState(70);
  const [simLabours, setSimLabours] = useState(2);
  const [simAssemblyTime, setSimAssemblyTime] = useState(30);

  // Live Simulator Computations
  const simAreaSqft = (simWidth * simLength) / 144;
  const simTotAreaSqft = simAreaSqft * simQty;
  const simRawCost = simTotAreaSqft * simBoardRate;
  const simCutCost = simCutTime * ratesForm.cuttingRatePerMin * simQty;
  const simEBCost = simEBInches * ratesForm.edgeBendingRatePerInch * simQty;
  const simAssemblyCost = simLabours * simAssemblyTime * ratesForm.labourRatePerMin;
  const simTotalBasic = simRawCost + simCutCost + simEBCost + simAssemblyCost;

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateManufacturingRates(ratesForm);
  };

  const handleOpenAddBoard = () => {
    setEditingBoardId(null);
    setBoardForm({
      name: '',
      ratePerSqft: 90,
      thicknessMm: 18,
      grade: 'Commercial HMR'
    });
    setIsBoardModalOpen(true);
  };

  const handleOpenEditBoard = (board: BoardRateMaster) => {
    setEditingBoardId(board.id);
    setBoardForm({
      name: board.name,
      ratePerSqft: board.ratePerSqft,
      thicknessMm: board.thicknessMm,
      grade: board.grade || ''
    });
    setIsBoardModalOpen(true);
  };

  const handleBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardForm.name.trim()) {
      showToast('Board Name is required', 'error');
      return;
    }
    if (editingBoardId) {
      updateBoardRate(editingBoardId, boardForm);
    } else {
      addBoardRate(boardForm);
    }
    setIsBoardModalOpen(false);
  };

  return (
    <div className="space-y-6" id="manufacturing-rates-container">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Clock className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manufacturing, Cutting & Labour Master Rates
            </h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Arbuda Steel Industries master rate engine. Configure per-minute machine cutting rates, per-minute assembly & labour wages, edge-banding rates, and raw board sq.ft masters.
          </p>
        </div>

        {permissions.canEditRates && (
          <button
            onClick={handleSaveRates}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors whitespace-nowrap"
          >
            <Save className="w-4 h-4" />
            <span>Save Rate Settings</span>
          </button>
        )}
      </div>

      {/* Primary Rate Configuration Grid */}
      <form onSubmit={handleSaveRates} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cutting Rate Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Material Cutting Cost</h3>
              <p className="text-xs text-slate-500">Panel saw / CNC cutting rate</p>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cutting Rate Per Minute (₹/min)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={ratesForm.cuttingRatePerMin}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, cuttingRatePerMin: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard Arbuda rate: <strong className="text-slate-800">₹8.00 / min</strong> (derived from ₹196.27 / 24.5 mins on 78x30 Cupboard)
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Daily Machine Overhead
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  value={ratesForm.dailyMachineCost}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, dailyMachineCost: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Assembly & Labour Rate Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Assembly & Labour Cost</h3>
              <p className="text-xs text-slate-500">Time-based technician rate</p>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Assembly Rate Per Minute (₹/min)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={ratesForm.labourRatePerMin}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, labourRatePerMin: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard Arbuda rate: <strong className="text-slate-800">₹5.00 / min</strong> (₹600 for 2 labours × 60 mins)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
              <div>
                <label className="block text-[10px] font-bold text-emerald-800 uppercase">Daily Wage</label>
                <input
                  type="number"
                  value={ratesForm.dailyLabourWage}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, dailyLabourWage: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 text-xs font-bold bg-white border border-emerald-300 rounded"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-800 uppercase">Working Hrs</label>
                <input
                  type="number"
                  value={ratesForm.workingHoursPerDay}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, workingHoursPerDay: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-2 py-1 text-xs font-bold bg-white border border-emerald-300 rounded"
                />
              </div>
              <div className="col-span-2 text-[11px] text-emerald-800 font-medium">
                Auto Wage/Min/Person = <strong>₹{calculatedLabourPerMin}/min</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Edge Bending & Overheads */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Edge Bending & Tax</h3>
              <p className="text-xs text-slate-500">PVC tape & margin parameters</p>
            </div>
          </div>

          <div className="pt-2 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Edge Bending Rate Per Inch (₹/inch)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={ratesForm.edgeBendingRatePerInch}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, edgeBendingRatePerInch: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full pl-8 pr-4 py-2 text-base font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard Arbuda rate: <strong className="text-slate-800">₹1.00 / inch</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Wastage %
                </label>
                <input
                  type="number"
                  value={ratesForm.boardWastagePercent}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, boardWastagePercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Default GST %
                </label>
                <input
                  type="number"
                  value={ratesForm.defaultGstPercent}
                  onChange={(e) =>
                    setRatesForm({ ...ratesForm, defaultGstPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full px-3 py-2 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Board Rate Master Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-lg">Raw Board Master Rates (Per SQFT)</h3>
          </div>

          {permissions.canEditRates && (
            <button
              onClick={handleOpenAddBoard}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Board Rate</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100/60 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
              <tr>
                <th className="px-5 py-3.5">Board / Sheet Material</th>
                <th className="px-5 py-3.5">Thickness (mm)</th>
                <th className="px-5 py-3.5">Grade / Specs</th>
                <th className="px-5 py-3.5 text-right">Rate Per SQFT (₹)</th>
                <th className="px-5 py-3.5 text-right">Full Sheet (8x4 = 32 sqft)</th>
                {permissions.canEditRates && <th className="px-5 py-3.5 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {manufacturingRates.boardRates.map((board) => (
                <tr key={board.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{board.name}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-600">{board.thicknessMm} mm</td>
                  <td className="px-5 py-3.5 text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-medium">
                      {board.grade || 'Standard'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900">
                    ₹{board.ratePerSqft.toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-mono text-emerald-700 font-semibold">
                    ₹{(board.ratePerSqft * 32).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  {permissions.canEditRates && (
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditBoard(board)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete board rate ${board.name}?`)) {
                              deleteBoardRate(board.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Interactive Plank Cost Calculator Simulator */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-6 shadow-md border border-slate-700">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-lg text-white">Live Cost Formula Simulator</h3>
          </div>
          <span className="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full font-medium">
            Formulas Linked to Active Rates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Width (in)</label>
            <input
              type="number"
              value={simWidth}
              onChange={(e) => setSimWidth(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Length (in)</label>
            <input
              type="number"
              value={simLength}
              onChange={(e) => setSimLength(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
            <input
              type="number"
              value={simQty}
              onChange={(e) => setSimQty(parseInt(e.target.value) || 1)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Board Rate/sqft</label>
            <input
              type="number"
              value={simBoardRate}
              onChange={(e) => setSimBoardRate(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cut Time (mins)</label>
            <input
              type="number"
              step="0.01"
              value={simCutTime}
              onChange={(e) => setSimCutTime(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">EB Length (in)</label>
            <input
              type="number"
              value={simEBInches}
              onChange={(e) => setSimEBInches(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Labours Count</label>
            <input
              type="number"
              value={simLabours}
              onChange={(e) => setSimLabours(parseInt(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Assly Time (min)</label>
            <input
              type="number"
              value={simAssemblyTime}
              onChange={(e) => setSimAssemblyTime(parseFloat(e.target.value) || 0)}
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-600 rounded text-white font-mono"
            />
          </div>
        </div>

        {/* Simulator Outputs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-3 border-t border-slate-700 text-center">
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400">Total Area</div>
            <div className="text-base font-bold text-amber-400 font-mono">
              {simTotAreaSqft.toFixed(2)} sq.ft
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Raw Mat: ₹{simRawCost.toFixed(2)}</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400">Cutting Cost</div>
            <div className="text-base font-bold text-blue-400 font-mono">₹{simCutCost.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 mt-1">{simCutTime}m × ₹{ratesForm.cuttingRatePerMin}/m</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400">Edge Bending</div>
            <div className="text-base font-bold text-purple-400 font-mono">₹{simEBCost.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 mt-1">{simEBInches}" × ₹{ratesForm.edgeBendingRatePerInch}/"</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400">Assembly / Labour</div>
            <div className="text-base font-bold text-emerald-400 font-mono">₹{simAssemblyCost.toFixed(2)}</div>
            <div className="text-[11px] text-slate-400 mt-1">{simLabours} workers × {simAssemblyTime}m</div>
          </div>

          <div className="bg-amber-600/30 p-3 rounded-lg border border-amber-500/40 col-span-2 md:col-span-1">
            <div className="text-xs text-amber-200 font-semibold">Total Basic Cost</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono">₹{simTotalBasic.toFixed(2)}</div>
            <div className="text-[11px] text-amber-200 mt-1">+15% Margin: ₹{(simTotalBasic * 1.15).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Add / Edit Board Modal */}
      {isBoardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingBoardId ? 'Edit Board Rate Master' : 'Add New Board Material'}
              </h3>
              <button
                onClick={() => setIsBoardModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBoardSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Board Material Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ACTION TESSA 90, RATE 18MM PLB"
                  value={boardForm.name}
                  onChange={(e) => setBoardForm({ ...boardForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Rate Per SQFT (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={boardForm.ratePerSqft}
                    onChange={(e) =>
                      setBoardForm({ ...boardForm, ratePerSqft: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Thickness (mm) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={boardForm.thicknessMm}
                    onChange={(e) =>
                      setBoardForm({ ...boardForm, thicknessMm: parseFloat(e.target.value) || 18 })
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Grade / Specs
                </label>
                <input
                  type="text"
                  placeholder="e.g. BWR, Pre-lam PLB, HDHMR"
                  value={boardForm.grade}
                  onChange={(e) => setBoardForm({ ...boardForm, grade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBoardModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                >
                  {editingBoardId ? 'Update Board' : 'Save Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
