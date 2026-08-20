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
  BarChart3,
  Scissors,
  Ruler,
  Clock,
  Building2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    arbudaCostings,
    quotations,
    invoices,
    customers,
    products,
    materials,
    units
  } = useApp();

  const navGroups = [
    {
      group: 'Commercial & Costing',
      items: [
        { id: 'costing_master', label: 'Costing Sheet Master', icon: FileSpreadsheet, badge: 'Master', count: arbudaCostings.length },
        { id: 'cutlist_optimizer', label: 'CutList Optimizer', icon: Scissors, badge: '2D Cut' },
        { id: 'manufacturing_rates', label: 'Cutting & Labour Rates', icon: Clock, badge: 'Per Min' },
        { id: 'unit_master', label: 'Unit Master', icon: Ruler, count: units.length }
      ]
    },
    {
      group: 'Sales & Invoicing',
      items: [
        { id: 'quotations', label: 'Quotations', icon: FileText, count: quotations.length },
        { id: 'invoices', label: 'Invoices & Payments', icon: Receipt, count: invoices.length },
        { id: 'customers', label: 'Customers CRM', icon: Users, count: customers.length }
      ]
    },
    {
      group: 'Inventory & Masters',
      items: [
        { id: 'products', label: 'Products Master', icon: Package, count: products.length },
        { id: 'materials', label: 'Materials Inventory', icon: Layers, count: materials.length },
        { id: 'calculator', label: 'Quick Calculator', icon: Calculator },
        { id: 'costings', label: 'Costing Archive', icon: History },
        { id: 'excel', label: 'Excel Data Migration', icon: FileSpreadsheet, badge: 'Import' },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
      ]
    }
  ];

  return (
    <aside id="app-sidebar" className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="pb-4 border-b border-slate-800 flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-amber-600 text-white rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-white tracking-tight leading-tight">
              Arbuda Steel
            </h1>
            <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
              Industries Costing ERP
            </p>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
                {group.group}
              </div>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-tab-${item.id}`}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-600 text-white font-semibold shadow-xs'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              isActive
                                ? 'bg-amber-700 text-amber-100'
                                : 'bg-slate-800 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}

                        {item.count !== null && item.count !== undefined && (
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                              isActive ? 'bg-slate-900 text-white' : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.count}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-800/80 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-300 font-medium text-[11px]">System Online</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">v3.2</span>
        </div>
      </div>
    </aside>
  );
};
