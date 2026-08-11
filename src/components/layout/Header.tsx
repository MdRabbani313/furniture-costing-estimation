import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { Shield, RefreshCw, Calculator, FileSpreadsheet, PlusCircle } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentRole, setCurrentRole, activeTab, setActiveTab, resetToSampleData } = useApp();

  const tabLabels: Record<string, string> = {
    dashboard: 'Overview',
    calculator: 'Costing Engine',
    costings: 'Costing History',
    products: 'Product Master',
    materials: 'Material Library',
    rates: 'Rates & Labour',
    quotations: 'Quotations',
    invoices: 'Invoices & Payments',
    customers: 'Customers',
    excel: 'Excel Migration',
    reports: 'Reports & Analytics'
  };

  const roleLabels: Record<UserRole, { title: string; color: string; desc: string }> = {
    super_admin: { title: 'Super Admin', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', desc: 'Full Access (Rates, Margins & Financials)' },
    costing_user: { title: 'Costing Lead', color: 'bg-blue-50 text-blue-800 border-blue-200', desc: 'Products, Materials, Labour & Costings' },
    sales_user: { title: 'Sales Exec', color: 'bg-amber-50 text-amber-800 border-amber-200', desc: 'Customers, Quotations & Sales Orders' },
    accounts_user: { title: 'Accounts Mgr', color: 'bg-purple-50 text-purple-800 border-purple-200', desc: 'Tax Invoices, Payments & Ledger' }
  };

  return (
    <header id="app-header" className="h-16 bg-white border-b border-[#E5E7EB] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 text-[#111827]">
      {/* Left Breadcrumb & Status */}
      <div className="flex items-center space-x-3">
        <div className="text-xs text-gray-500">
          Commercial Management &bull;{' '}
          <span className="text-gray-900 font-semibold">{tabLabels[activeTab] || 'Overview'}</span>
        </div>
      </div>

      {/* Middle Quick Navigation */}
      <div className="hidden md:flex items-center space-x-2">
        <button
          id="btn-quick-costing"
          onClick={() => setActiveTab('calculator')}
          className={`px-3.5 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 transition-all ${
            activeTab === 'calculator'
              ? 'bg-[#111827] text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          + New Costing
        </button>

        <button
          id="btn-quick-excel"
          onClick={() => setActiveTab('excel')}
          className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'excel'
              ? 'bg-[#111827] text-white shadow-sm'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          Excel Migration
        </button>
      </div>

      {/* Right Role Switcher & Actions */}
      <div className="flex items-center space-x-3">
        <div className="relative flex items-center bg-gray-50 px-2 py-1 rounded-md border border-[#E5E7EB]">
          <Shield className="w-3.5 h-3.5 text-amber-700 mr-1 hidden sm:inline-block" />
          <select
            id="role-switcher"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value as UserRole)}
            className="bg-transparent text-xs font-medium text-gray-800 focus:outline-none cursor-pointer"
          >
            <option value="super_admin">Super Admin</option>
            <option value="costing_user">Costing User</option>
            <option value="sales_user">Sales User</option>
            <option value="accounts_user">Accounts User</option>
          </select>
        </div>

        <span
          id="active-role-badge"
          className={`text-[11px] px-2.5 py-0.5 rounded-md font-bold border hidden lg:inline-block ${roleLabels[currentRole].color}`}
          title={roleLabels[currentRole].desc}
        >
          {roleLabels[currentRole].title}
        </span>

        <button
          id="btn-reset-data"
          onClick={resetToSampleData}
          title="Reset to initial sample Excel dataset"
          className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

