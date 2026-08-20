import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, RefreshCw, Scissors, FileSpreadsheet, PlusCircle, Building2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentRole, setCurrentRole, activeTab, setActiveTab, resetToSampleData } = useApp();

  const tabLabels: Record<string, string> = {
    costing_master: 'Costing Sheet Master (BOM)',
    cutlist_optimizer: '2D CutList Sheet Optimizer',
    manufacturing_rates: 'Manufacturing & Labour Rates Master',
    unit_master: 'Unit of Measurement Master',
    quotations: 'Quotations & Invoicing',
    invoices: 'Tax Invoices & Payment Collections',
    customers: 'Customers CRM',
    products: 'Products Master',
    materials: 'Raw Materials Master',
    calculator: 'Quick Cost Calculator',
    costings: 'Costing Archive',
    excel: 'Excel Data Migration',
    reports: 'Reports & Analytics'
  };

  const roleLabels: Record<UserRole, { title: string; color: string; desc: string }> = {
    super_admin: { title: 'Super Admin', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', desc: 'Full Access (Rates, Margins & Financials)' },
    costing_user: { title: 'Costing Lead', color: 'bg-blue-50 text-blue-800 border-blue-200', desc: 'Products, Materials, Labour & Costings' },
    sales_user: { title: 'Sales Exec', color: 'bg-amber-50 text-amber-800 border-amber-200', desc: 'Customers, Quotations & Sales Orders' },
    accounts_user: { title: 'Accounts Mgr', color: 'bg-purple-50 text-purple-800 border-purple-200', desc: 'Tax Invoices, Payments & Ledger' }
  };

  return (
    <header id="app-header" className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 text-slate-900">
      {/* Left Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-amber-700 font-bold hidden sm:inline">Arbuda Steel Industries</span>
          <span className="hidden sm:inline">&bull;</span>
          <span className="text-slate-900 font-bold">{tabLabels[activeTab] || 'Overview'}</span>
        </div>
      </div>

      {/* Middle Quick Navigation */}
      <div className="hidden md:flex items-center space-x-2">
        <button
          id="btn-quick-costing"
          onClick={() => setActiveTab('costing_master')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'costing_master'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Costing Sheet Master</span>
        </button>

        <button
          id="btn-quick-cutlist"
          onClick={() => setActiveTab('cutlist_optimizer')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeTab === 'cutlist_optimizer'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>CutList Optimizer</span>
        </button>
      </div>

      {/* Right Role Switcher & Actions */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-amber-700 mr-1.5 hidden sm:inline-block" />
          <select
            id="role-switcher"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="super_admin">Super Admin</option>
            <option value="costing_user">Costing Lead</option>
            <option value="sales_user">Sales Exec</option>
            <option value="accounts_user">Accounts Mgr</option>
          </select>
        </div>

        <span
          id="active-role-badge"
          className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border hidden lg:inline-block ${roleLabels[currentRole].color}`}
          title={roleLabels[currentRole].desc}
        >
          {roleLabels[currentRole].title}
        </span>

        <button
          id="btn-reset-data"
          onClick={resetToSampleData}
          title="Reset database to Arbuda Steel Industries initial master data"
          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
