import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  downloadExcelMigrationTemplate,
  parseUploadedExcelFile,
  exportSystemDataToExcel,
  ExcelImportResult
} from '../../utils/excelUtils';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Database
} from 'lucide-react';

export const ExcelMigrationModal: React.FC = () => {
  const { materials, products, costings, importBulkData, showToast } = useApp();

  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImporting(true);
    setImportResult(null);

    const result = await parseUploadedExcelFile(file);
    setImportResult(result);
    setImporting(false);
  };

  const handleCommitImport = () => {
    if (!importResult) return;
    importBulkData(importResult.materials, importResult.products);
    setImportResult(null);
    setFileName('');
  };

  return (
    <div id="excel-migration-tool-view" className="space-y-6">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-xl border border-slate-800 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            Requirement 12: Excel Migration Engine
          </span>
          <h2 className="text-xl font-bold mt-2 text-white">
            Legacy Excel Data Migration & Sheet Import Tool
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Import existing Sheet 1 (Product & Costing Data) and Sheet 2 (Material & Item Rate Master) into the web portal database.
          </p>
        </div>

        <button
          onClick={downloadExcelMigrationTemplate}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all shrink-0"
        >
          <Download className="w-4 h-4" /> Download Excel Migration Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Upload Excel File */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Upload Legacy Excel Workbook</h3>
          </div>
          <p className="text-xs text-slate-500">
            Select your `.xlsx` or `.csv` spreadsheet file containing Sheet 1 (Products) and Sheet 2 (Material Master).
          </p>

          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-8 text-center bg-slate-50 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <label className="cursor-pointer">
              <span className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg inline-block shadow-sm">
                Choose Excel File (.xlsx)
              </span>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {fileName && <p className="text-xs font-bold text-slate-800 mt-3 font-mono">{fileName}</p>}
          </div>

          {importing && (
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900 font-medium flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              Parsing Excel sheets and validating rates formula...
            </div>
          )}

          {importResult && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Parsed {importResult.summary.materialsCount} Materials & {importResult.summary.productsCount} Products successfully!
              </div>

              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div>Sheet 1: {importResult.summary.productsCount} Products found</div>
                <div>Sheet 2: {importResult.summary.materialsCount} Material Rates found</div>
              </div>

              <button
                onClick={handleCommitImport}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <Database className="w-4 h-4" /> Import Data into Web Portal
              </button>
            </div>
          )}
        </div>

        {/* Card 2: Export Current Portal Database */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">Export Portal Database to Excel</h3>
          </div>
          <p className="text-xs text-slate-500">
            Download all current live products, active material rates, and historical costing records back to a structured Excel file.
          </p>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Active Material Master Items:</span>
              <span className="font-bold font-mono text-slate-900">{materials.length} Items</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Active Furniture Products:</span>
              <span className="font-bold font-mono text-slate-900">{products.length} Products</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Saved Costing Calculations:</span>
              <span className="font-bold font-mono text-slate-900">{costings.length} Costings</span>
            </div>
          </div>

          <button
            onClick={() => exportSystemDataToExcel(materials, products, costings)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-400" /> Export System Data (.xlsx)
          </button>
        </div>
      </div>
    </div>
  );
};
