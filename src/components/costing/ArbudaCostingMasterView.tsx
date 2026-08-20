import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PlankCostingRow, ArbudaCostingMaster, PlankItemType, CutListPanel } from '../../types';
import {
  FileSpreadsheet,
  Plus,
  Trash2,
  Copy,
  Scissors,
  Users,
  Layers,
  Sparkles,
  Download,
  Printer,
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  Percent,
  Sliders,
  ChevronDown
} from 'lucide-react';

export const ArbudaCostingMasterView: React.FC = () => {
  const {
    arbudaCostings,
    activeArbudaCostingId,
    setActiveArbudaCostingId,
    updateArbudaCosting,
    addArbudaCosting,
    deleteArbudaCosting,
    manufacturingRates,
    setCutListTransferPlanks,
    setActiveTab,
    addQuotation,
    customers,
    permissions,
    currency,
    showToast
  } = useApp();

  const activeCosting =
    arbudaCostings.find((c) => c.id === activeArbudaCostingId) || arbudaCostings[0];

  const [selectedFilterType, setSelectedFilterType] = useState<string>('ALL');

  if (!activeCosting) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500">No Costing Sheet found.</p>
      </div>
    );
  }

  // Recalculate row mathematics dynamically based on active rates
  const calculateRowCosts = (
    row: PlankCostingRow,
    cuttingRate: number,
    labourRate: number,
    ebRate: number,
    boardRates: typeof manufacturingRates.boardRates
  ): PlankCostingRow => {
    const isPlank = row.type === 'PLB' || row.type === 'FABRICATION';
    const isAssembly = row.type === 'ASSEMBLY';
    const isPurchase = row.type === 'PURCHASE' || row.type === 'HARDWARE';

    // 1. Dimensions and Area
    const areaSqFt = isPlank && row.widthInches > 0 && row.lengthInches > 0
      ? Number(((row.widthInches * row.lengthInches) / 144).toFixed(2))
      : 0;
    const totAreaSqFt = Number((areaSqFt * row.totQty).toFixed(2));

    // 2. Raw Material Cost
    let rawMaterialCost = 0;
    if (isPlank && row.material) {
      const board = boardRates.find((b) => b.name.toLowerCase() === row.material.toLowerCase()) || boardRates.find((b) => b.name.includes('PLB'));
      const ratePerSqft = board ? board.ratePerSqft : 33;
      rawMaterialCost = Number((totAreaSqFt * ratePerSqft).toFixed(2));
    }

    // 3. Cutting Cost
    const cuttingCost = isPlank
      ? Number((row.cuttingTimeMins * cuttingRate * row.totQty).toFixed(2))
      : 0;

    // 4. Edge Bending
    const totalEdgeBendingLengthInches = isPlank
      ? Number(((row.widthInches * row.edgeBendingWidthWise + row.lengthInches * row.edgeBendingLengthWise) * row.totQty).toFixed(2))
      : 0;
    const edgeBendingCost = Number((totalEdgeBendingLengthInches * ebRate).toFixed(2));

    // 5. Purchase Cost
    const purchaseCost = isPurchase
      ? Number((row.purchaseRate * row.totQty).toFixed(2))
      : 0;

    // 6. Assembly Cost
    const assemblyCost = isAssembly
      ? Number((row.nosOfLabours * row.labourTimeMins * labourRate * row.totQty).toFixed(2))
      : 0;

    // 7. Basic Cost & Margin
    const basicCost = Number(
      (rawMaterialCost + cuttingCost + edgeBendingCost + purchaseCost + assemblyCost).toFixed(2)
    );
    const marginPct = row.profitMarginPercent || 15;
    const profitMarginAmount = Number(((basicCost * marginPct) / 100).toFixed(2));
    const sellingPrice = Number((basicCost + profitMarginAmount).toFixed(2));

    return {
      ...row,
      areaSqFt,
      totAreaSqFt,
      rawMaterialCost,
      cuttingCost,
      totalEdgeBendingLengthInches,
      edgeBendingCost,
      purchaseCost,
      assemblyCost,
      basicCost,
      profitMarginAmount,
      sellingPrice
    };
  };

  // Recalculate whole costing sheet totals
  const recalculateMaster = (costing: ArbudaCostingMaster, updatedRows: PlankCostingRow[]) => {
    const cuttingRate = costing.cuttingRatePerMin || manufacturingRates.cuttingRatePerMin;
    const labourRate = costing.labourRatePerMin || manufacturingRates.labourRatePerMin;
    const ebRate = costing.edgeBendingRatePerInch || manufacturingRates.edgeBendingRatePerInch;

    const recalculatedRows = updatedRows.map((r) =>
      calculateRowCosts(r, cuttingRate, labourRate, ebRate, manufacturingRates.boardRates)
    );

    const totalRawMaterialCost = Number(
      recalculatedRows.reduce((sum, r) => sum + r.rawMaterialCost, 0).toFixed(2)
    );
    const totalCuttingCost = Number(
      recalculatedRows.reduce((sum, r) => sum + r.cuttingCost, 0).toFixed(2)
    );
    const totalEdgeBendingCost = Number(
      recalculatedRows.reduce((sum, r) => sum + r.edgeBendingCost, 0).toFixed(2)
    );
    const totalPurchaseCost = Number(
      recalculatedRows.reduce((sum, r) => sum + r.purchaseCost, 0).toFixed(2)
    );
    const totalAssemblyCost = Number(
      recalculatedRows.reduce((sum, r) => sum + r.assemblyCost, 0).toFixed(2)
    );

    const totalBasicCost = Number(
      (totalRawMaterialCost + totalCuttingCost + totalEdgeBendingCost + totalPurchaseCost + totalAssemblyCost).toFixed(2)
    );

    const marginPercent = costing.overallMarginPercent || 15;
    const totalProfitMarginAmount = Number(((totalBasicCost * marginPercent) / 100).toFixed(2));
    const finalOfferPrice = Number((totalBasicCost + totalProfitMarginAmount).toFixed(2));
    const gstPercent = costing.gstPercent || 18;
    const gstAmount = Number(((finalOfferPrice * gstPercent) / 100).toFixed(2));
    const totalWithGst = Number((finalOfferPrice + gstAmount).toFixed(2));

    updateArbudaCosting(costing.id, {
      rows: recalculatedRows,
      totalRawMaterialCost,
      totalCuttingCost,
      totalEdgeBendingCost,
      totalPurchaseCost,
      totalAssemblyCost,
      totalBasicCost,
      totalProfitMarginAmount,
      finalOfferPrice,
      gstAmount,
      totalWithGst
    });
  };

  // Row operations
  const handleUpdateRow = (rowId: string, updates: Partial<PlankCostingRow>) => {
    const updatedRows = activeCosting.rows.map((r) => (r.id === rowId ? { ...r, ...updates } : r));
    recalculateMaster(activeCosting, updatedRows);
  };

  const handleAddRow = () => {
    const newSrNo = activeCosting.rows.length + 1;
    const newRow: PlankCostingRow = {
      id: `r-${Date.now()}`,
      srNo: newSrNo,
      partCode: `PLANK-${newSrNo}`,
      description: 'NEW PANEL COMPONENT',
      totQty: 1,
      type: 'PLB',
      material: manufacturingRates.boardRates[0]?.name || 'RATE 18MM PLB',
      thick: 18,
      widthInches: 18,
      lengthInches: 30,
      areaSqFt: 3.75,
      totAreaSqFt: 3.75,
      rawMaterialCost: 123.75,
      cuttingTimeMins: 0.8,
      cuttingCost: 6.4,
      edgeBendingWidthWise: 0,
      edgeBendingLengthWise: 1,
      totalEdgeBendingLengthInches: 30,
      edgeBendingCost: 30,
      purchaseRate: 0,
      purchaseCost: 0,
      nosOfLabours: 0,
      labourTimeMins: 0,
      assemblyCost: 0,
      basicCost: 160.15,
      profitMarginPercent: 15,
      profitMarginAmount: 24.02,
      sellingPrice: 184.17
    };
    recalculateMaster(activeCosting, [...activeCosting.rows, newRow]);
    showToast('Added new plank row to costing master!');
  };

  const handleDuplicateRow = (row: PlankCostingRow) => {
    const newRow: PlankCostingRow = {
      ...row,
      id: `r-${Date.now()}`,
      srNo: activeCosting.rows.length + 1,
      partCode: `${row.partCode}-COPY`
    };
    recalculateMaster(activeCosting, [...activeCosting.rows, newRow]);
    showToast('Row duplicated');
  };

  const handleDeleteRow = (rowId: string) => {
    if (activeCosting.rows.length <= 1) {
      showToast('Costing sheet must have at least one row', 'error');
      return;
    }
    const updatedRows = activeCosting.rows.filter((r) => r.id !== rowId);
    recalculateMaster(activeCosting, updatedRows);
    showToast('Row removed');
  };

  // 1-Click Send to CutList Optimizer
  const handleSendToCutList = () => {
    const plbRows = activeCosting.rows.filter(
      (r) => (r.type === 'PLB' || r.type === 'FABRICATION') && r.widthInches > 0 && r.lengthInches > 0
    );

    if (plbRows.length === 0) {
      showToast('No board/plank panels found to optimize', 'error');
      return;
    }

    const cutListPanels: CutListPanel[] = plbRows.map((r, idx) => ({
      id: `cl-${r.id}`,
      name: `${r.partCode} (${r.description})`,
      length: r.lengthInches,
      width: r.widthInches,
      quantity: r.totQty,
      material: r.material || '18mm Board',
      canRotate: true,
      edgeBending: {
        top: r.edgeBendingWidthWise > 0,
        bottom: r.edgeBendingWidthWise > 1,
        left: r.edgeBendingLengthWise > 0,
        right: r.edgeBendingLengthWise > 1
      }
    }));

    setCutListTransferPlanks(cutListPanels);
    setActiveTab('cutlist_optimizer');
    showToast(`Transferred ${cutListPanels.length} panel types to CutList Optimizer!`);
  };

  // 1-Click Convert to Quotation
  const handleConvertToQuotation = () => {
    const cust = customers[0] || {
      id: 'cust-walkin',
      name: 'Walk-in Commercial Client',
      email: 'client@arbudasteel.com',
      phone: '+91 98765 43210',
      billingAddress: 'Commercial Plaza, Ahmedabad'
    };

    const newQuo = addQuotation({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      billingAddress: cust.billingAddress,
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: `qi-${Date.now()}`,
          costingId: activeCosting.id,
          productName: `${activeCosting.modelName} (${activeCosting.modelCode})`,
          description: `Custom manufactured cabinet. Dimensions: ${activeCosting.dimensions.width}" W x ${activeCosting.dimensions.height}" H x ${activeCosting.dimensions.depth}" D`,
          variantOrSize: `${activeCosting.dimensions.width}"x${activeCosting.dimensions.height}"x${activeCosting.dimensions.depth}"`,
          quantity: 1,
          unitPrice: activeCosting.finalOfferPrice,
          discountPercent: 0,
          netPrice: activeCosting.finalOfferPrice,
          gstPercent: activeCosting.gstPercent || 18,
          totalAmount: activeCosting.totalWithGst
        }
      ],
      subtotal: activeCosting.finalOfferPrice,
      discountAmount: 0,
      taxTotal: activeCosting.gstAmount,
      grandTotal: activeCosting.totalWithGst,
      termsAndConditions: '1. 50% advance along with confirmed purchase order.\n2. Delivery within 10-14 working days from approval.\n3. Arbuda Steel Industries standard quality warranty included.',
      status: 'Draft',
      createdBy: 'Rajesh (Costing Lead)',
      notes: `Generated from Arbuda Costing Sheet Master (${activeCosting.modelName})`
    });

    setActiveTab('quotations');
    showToast(`Quotation ${newQuo.quotationNumber} generated successfully!`);
  };

  const filteredRows = activeCosting.rows.filter(
    (r) => selectedFilterType === 'ALL' || r.type === selectedFilterType
  );

  return (
    <div className="space-y-6" id="arbuda-costing-master-view">
      {/* Top Header & Model Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {activeCosting.modelName}
                </h1>
                <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-mono text-xs font-bold">
                  {activeCosting.modelCode}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                  {activeCosting.category}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dimensions: <strong className="text-slate-800">{activeCosting.dimensions.width}" W × {activeCosting.dimensions.height}" H × {activeCosting.dimensions.depth}" D</strong> | Arbuda Steel Industries Official Commercial Master
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            id="btn-send-cutlist"
            onClick={handleSendToCutList}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
            title="Transfer all PLB planks into 2D CutList Optimizer"
          >
            <Scissors className="w-4 h-4" />
            <span>Open in CutList Optimizer</span>
          </button>

          <button
            id="btn-convert-quotation"
            onClick={handleConvertToQuotation}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Raw Board</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            ₹{activeCosting.totalRawMaterialCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">PLB / Pre-lam boards</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Cutting Time</span>
            <Scissors className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            ₹{activeCosting.totalCuttingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">@ ₹{activeCosting.cuttingRatePerMin}/min</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Edge Bending</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            ₹{activeCosting.totalEdgeBendingCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">@ ₹{activeCosting.edgeBendingRatePerInch}/in</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Purchase/Hrdw</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            ₹{activeCosting.totalPurchaseCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Locks, slides, hinges</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Assembly Lab</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900 font-mono">
            ₹{activeCosting.totalAssemblyCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">@ ₹{activeCosting.labourRatePerMin}/min</div>
        </div>

        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-100 mb-1">
            <span>Final Offer (+18% GST)</span>
            <Sparkles className="w-4 h-4 text-amber-200" />
          </div>
          <div className="text-xl font-extrabold text-white font-mono">
            ₹{activeCosting.totalWithGst.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-200 mt-1">Offer: ₹{activeCosting.finalOfferPrice.toFixed(0)}</div>
        </div>
      </div>

      {/* Filter & Add Row Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-500 uppercase shrink-0">Filter:</span>
          {['ALL', 'PLB', 'PURCHASE', 'ASSEMBLY', 'FABRICATION'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedFilterType(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedFilterType === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t} ({t === 'ALL' ? activeCosting.rows.length : activeCosting.rows.filter((r) => r.type === t).length})
            </button>
          ))}
        </div>

        {permissions.canEditRates && (
          <button
            onClick={handleAddRow}
            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plank / Row</span>
          </button>
        )}
      </div>

      {/* Spreadsheet Master Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[700px]">
          <table className="w-full text-left text-xs border-collapse" id="costing-master-table">
            <thead className="bg-slate-100 border-b border-slate-300 sticky top-0 z-10 text-[11px] font-bold text-slate-700 uppercase tracking-tight select-none">
              <tr>
                <th className="px-3 py-3 border-r border-slate-200 text-center w-12">Sr</th>
                <th className="px-3 py-3 border-r border-slate-200 min-w-[140px]">Part Code</th>
                <th className="px-3 py-3 border-r border-slate-200 min-w-[170px]">Description</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center w-14">Qty</th>
                <th className="px-3 py-3 border-r border-slate-200 w-24">Type</th>
                <th className="px-3 py-3 border-r border-slate-200 min-w-[160px]">Material / Board</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center w-14">W (in)</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center w-14">L (in)</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right bg-blue-50/50">Tot SqFt</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right bg-blue-50/50">Raw Mat ₹</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center bg-amber-50/50">Cut Min</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right bg-amber-50/50">Cut Cost ₹</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center bg-purple-50/50">EB W</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center bg-purple-50/50">EB L</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right bg-purple-50/50">EB Cost ₹</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right">Pur Rate ₹</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right">Pur Cost ₹</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center bg-emerald-50/50">Labours</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center bg-emerald-50/50">Lab Min</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right bg-emerald-50/50">Assly Cost ₹</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right font-black bg-slate-200/80">Basic Cost ₹</th>
                <th className="px-2 py-3 border-r border-slate-200 text-center">Mrg %</th>
                <th className="px-3 py-3 border-r border-slate-200 text-right font-black text-amber-700 bg-amber-50">Selling ₹</th>
                {permissions.canEditRates && <th className="px-2 py-3 text-center">Act</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {filteredRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`hover:bg-amber-50/40 transition-colors font-mono ${
                    row.type === 'ASSEMBLY'
                      ? 'bg-emerald-50/20'
                      : row.type === 'PURCHASE'
                      ? 'bg-slate-50/60'
                      : ''
                  }`}
                >
                  {/* Sr No */}
                  <td className="px-3 py-2 border-r border-slate-200 text-center text-slate-500 font-sans">
                    {idx + 1}
                  </td>

                  {/* Part Code */}
                  <td className="px-3 py-2 border-r border-slate-200 font-sans font-bold text-slate-900">
                    <input
                      type="text"
                      value={row.partCode}
                      onChange={(e) => handleUpdateRow(row.id, { partCode: e.target.value })}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white px-1 py-0.5 rounded text-xs"
                    />
                  </td>

                  {/* Description */}
                  <td className="px-3 py-2 border-r border-slate-200 font-sans">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => handleUpdateRow(row.id, { description: e.target.value })}
                      className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white px-1 py-0.5 rounded text-xs font-semibold"
                    />
                  </td>

                  {/* Tot Qty */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center font-bold text-slate-900">
                    <input
                      type="number"
                      value={row.totQty}
                      onChange={(e) => handleUpdateRow(row.id, { totQty: parseInt(e.target.value) || 1 })}
                      className="w-12 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5"
                    />
                  </td>

                  {/* Type */}
                  <td className="px-2 py-2 border-r border-slate-200">
                    <select
                      value={row.type}
                      onChange={(e) => handleUpdateRow(row.id, { type: e.target.value as PlankItemType })}
                      className="text-[11px] font-bold bg-white border border-slate-200 rounded px-1.5 py-0.5"
                    >
                      <option value="PLB">PLB</option>
                      <option value="ASSEMBLY">ASSEMBLY</option>
                      <option value="PURCHASE">PURCHASE</option>
                      <option value="HARDWARE">HARDWARE</option>
                      <option value="FABRICATION">FABRICATION</option>
                    </select>
                  </td>

                  {/* Material */}
                  <td className="px-3 py-2 border-r border-slate-200">
                    {row.type === 'PLB' || row.type === 'FABRICATION' ? (
                      <select
                        value={row.material}
                        onChange={(e) => handleUpdateRow(row.id, { material: e.target.value })}
                        className="text-[11px] bg-white border border-slate-200 rounded px-1 py-0.5 w-full truncate font-sans"
                      >
                        {manufacturingRates.boardRates.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name} (₹{b.ratePerSqft}/sqft)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={row.material || '-'}
                        onChange={(e) => handleUpdateRow(row.id, { material: e.target.value })}
                        className="w-full text-[11px] bg-transparent text-slate-500 px-1 py-0.5"
                      />
                    )}
                  </td>

                  {/* Width (in) */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center">
                    {row.type === 'PLB' || row.type === 'FABRICATION' ? (
                      <input
                        type="number"
                        value={row.widthInches}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { widthInches: parseFloat(e.target.value) || 0 })
                        }
                        className="w-12 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5 font-bold"
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Length (in) */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center">
                    {row.type === 'PLB' || row.type === 'FABRICATION' ? (
                      <input
                        type="number"
                        value={row.lengthInches}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { lengthInches: parseFloat(e.target.value) || 0 })
                        }
                        className="w-12 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5 font-bold"
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Tot Area SqFt */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right bg-blue-50/20 font-semibold">
                    {row.totAreaSqFt > 0 ? row.totAreaSqFt.toFixed(2) : '-'}
                  </td>

                  {/* Raw Material Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right bg-blue-50/20 font-bold text-blue-900">
                    {row.rawMaterialCost > 0 ? `₹${row.rawMaterialCost.toFixed(2)}` : '-'}
                  </td>

                  {/* Cutting Time (mins) */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center bg-amber-50/20">
                    {row.type === 'PLB' || row.type === 'FABRICATION' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={row.cuttingTimeMins}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { cuttingTimeMins: parseFloat(e.target.value) || 0 })
                        }
                        className="w-14 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5"
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Cutting Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right bg-amber-50/20 font-bold text-amber-900">
                    {row.cuttingCost > 0 ? `₹${row.cuttingCost.toFixed(2)}` : '-'}
                  </td>

                  {/* EB Width count */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center bg-purple-50/20">
                    {row.type === 'PLB' ? (
                      <select
                        value={row.edgeBendingWidthWise}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { edgeBendingWidthWise: parseInt(e.target.value) || 0 })
                        }
                        className="bg-white border border-slate-200 rounded px-1 text-center"
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                      </select>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* EB Length count */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center bg-purple-50/20">
                    {row.type === 'PLB' ? (
                      <select
                        value={row.edgeBendingLengthWise}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { edgeBendingLengthWise: parseInt(e.target.value) || 0 })
                        }
                        className="bg-white border border-slate-200 rounded px-1 text-center"
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                      </select>
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* EB Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right bg-purple-50/20 font-bold text-purple-900">
                    {row.edgeBendingCost > 0 ? `₹${row.edgeBendingCost.toFixed(2)}` : '-'}
                  </td>

                  {/* Purchase Rate */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right">
                    {row.type === 'PURCHASE' || row.type === 'HARDWARE' ? (
                      <input
                        type="number"
                        step="0.01"
                        value={row.purchaseRate}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { purchaseRate: parseFloat(e.target.value) || 0 })
                        }
                        className="w-16 text-right bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5 font-bold"
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Purchase Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-bold text-slate-800">
                    {row.purchaseCost > 0 ? `₹${row.purchaseCost.toFixed(2)}` : '-'}
                  </td>

                  {/* Nos of Labours */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center bg-emerald-50/20">
                    {row.type === 'ASSEMBLY' ? (
                      <input
                        type="number"
                        value={row.nosOfLabours}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { nosOfLabours: parseInt(e.target.value) || 0 })
                        }
                        className="w-12 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5 font-bold"
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Labour Time (min) */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center bg-emerald-50/20">
                    {row.type === 'ASSEMBLY' ? (
                      <input
                        type="number"
                        value={row.labourTimeMins}
                        onChange={(e) =>
                          handleUpdateRow(row.id, { labourTimeMins: parseFloat(e.target.value) || 0 })
                        }
                        className="w-14 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5 font-bold"
                      />
                    ) : (
                      '-'
                    )}
                  </td>

                  {/* Assembly Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50/20 font-bold text-emerald-900">
                    {row.assemblyCost > 0 ? `₹${row.assemblyCost.toFixed(2)}` : '-'}
                  </td>

                  {/* Basic Cost */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-black bg-slate-100 text-slate-900">
                    ₹{row.basicCost.toFixed(2)}
                  </td>

                  {/* Profit Margin % */}
                  <td className="px-2 py-2 border-r border-slate-200 text-center">
                    <input
                      type="number"
                      value={row.profitMarginPercent}
                      onChange={(e) =>
                        handleUpdateRow(row.id, { profitMarginPercent: parseFloat(e.target.value) || 0 })
                      }
                      className="w-10 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-amber-500 focus:bg-white rounded py-0.5 text-[11px]"
                    />
                  </td>

                  {/* Selling Price */}
                  <td className="px-3 py-2 border-r border-slate-200 text-right font-black text-amber-800 bg-amber-50/60">
                    ₹{row.sellingPrice.toFixed(2)}
                  </td>

                  {/* Actions */}
                  {permissions.canEditRates && (
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDuplicateRow(row)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded"
                          title="Duplicate row"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>

            {/* Table Footer Totals */}
            <tfoot className="bg-slate-900 text-white font-mono font-bold text-xs sticky bottom-0 z-10">
              <tr>
                <td colSpan={8} className="px-4 py-3 text-right uppercase tracking-wider font-sans font-black text-amber-400">
                  Total Sheet Aggregates
                </td>
                <td className="px-3 py-3 text-right text-blue-300">
                  {activeCosting.rows.reduce((s, r) => s + r.totAreaSqFt, 0).toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right text-blue-300">
                  ₹{activeCosting.totalRawMaterialCost.toFixed(2)}
                </td>
                <td className="px-2 py-3 text-center text-amber-300">
                  {activeCosting.rows.reduce((s, r) => s + r.cuttingTimeMins, 0).toFixed(1)}m
                </td>
                <td className="px-3 py-3 text-right text-amber-300">
                  ₹{activeCosting.totalCuttingCost.toFixed(2)}
                </td>
                <td colSpan={2} className="px-2 py-3 text-center text-purple-300">-</td>
                <td className="px-3 py-3 text-right text-purple-300">
                  ₹{activeCosting.totalEdgeBendingCost.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right">-</td>
                <td className="px-3 py-3 text-right text-slate-300">
                  ₹{activeCosting.totalPurchaseCost.toFixed(2)}
                </td>
                <td colSpan={2} className="px-2 py-3 text-center text-emerald-300">-</td>
                <td className="px-3 py-3 text-right text-emerald-300">
                  ₹{activeCosting.totalAssemblyCost.toFixed(2)}
                </td>
                <td className="px-3 py-3 text-right text-amber-400 font-black text-sm">
                  ₹{activeCosting.totalBasicCost.toFixed(2)}
                </td>
                <td className="px-2 py-3 text-center text-amber-300">
                  {activeCosting.overallMarginPercent}%
                </td>
                <td className="px-3 py-3 text-right text-emerald-400 font-black text-sm">
                  ₹{activeCosting.finalOfferPrice.toFixed(2)}
                </td>
                {permissions.canEditRates && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
