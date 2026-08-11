import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calculator,
  History,
  Package,
  Layers,
  TrendingUp,
  FileText,
  Receipt,
  Users,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, costings, products, materials, quotations, invoices, customers } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { id: 'calculator', label: 'Costing Engine', icon: Calculator, badge: 'Auto' },
    { id: 'costings', label: 'Costing History', icon: History, count: costings.length },
    { id: 'products', label: 'Products Master', icon: Package, count: products.length },
    { id: 'materials', label: 'Material Master', icon: Layers, count: materials.length },
    { id: 'rates', label: 'Rates & Labour', icon: TrendingUp, count: null },
    { id: 'quotations', label: 'Quotations', icon: FileText, count: quotations.length },
    { id: 'invoices', label: 'Invoices & Payments', icon: Receipt, count: invoices.length },
    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
    { id: 'excel', label: 'Excel Migration', icon: FileSpreadsheet, badge: 'Import' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, count: null }
  ];

  return (
    <aside id="app-sidebar" className="w-full md:w-64 bg-white border-r border-[#E5E7EB] shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div>
        {/* Brand Header */}
        <div className="pb-5 mb-4 border-b border-[#E5E7EB] flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-[#92400E] text-white rounded flex items-center justify-center font-bold shadow-sm">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg text-[#111827] tracking-tight leading-none">WoodCraft</h1>
            <p className="text-[11px] text-gray-500 mt-0.5">Commercial Engine</p>
          </div>
        </div>

        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Core Operations
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F3F4F6] text-[#111827] font-semibold'
                    : 'text-gray-500 hover:bg-[#F9FAFB] hover:text-[#111827]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#92400E]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-1.5 py-0.5 rounded font-bold">
                    {item.badge}
                  </span>
                )}

                {item.count !== null && item.count !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#111827] text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer info box */}
      <div className="pt-4 border-t border-[#E5E7EB]">
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-800 rounded-md text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
          Costing Engine v2.1
        </div>
      </div>
    </aside>
  );
};

