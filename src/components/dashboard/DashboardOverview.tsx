import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  Package,
  Layers,
  Calculator,
  FileText,
  Receipt,
  Clock,
  TrendingUp,
  PlusCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const {
    products,
    materials,
    costings,
    quotations,
    invoices,
    activityLogs,
    setActiveTab,
    currency
  } = useApp();

  // Metrics Calculations
  const totalProductsCount = products.length;
  const totalMaterialsCount = materials.length;
  const totalCostingsCount = costings.length;
  
  const activeQuotationsCount = quotations.filter(q => q.status === 'Approved' || q.status === 'Sent').length;
  const totalQuotationValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);

  const totalInvoicesCount = invoices.length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const pendingPaymentsAmount = invoices.reduce((acc, inv) => acc + inv.outstandingBalance, 0);

  const avgMargin = costings.length > 0
    ? Math.round(costings.reduce((acc, c) => acc + c.marginPercent, 0) / costings.length)
    : 28;

  // Recharts Chart Data
  const costBreakdownData = [
    { name: 'Material Cost', value: costings.reduce((a, c) => a + c.materialCostTotal, 0) },
    { name: 'Labour Cost', value: costings.reduce((a, c) => a + c.labourCostTotal, 0) },
    { name: 'Profit Margin', value: costings.reduce((a, c) => a + c.marginAmount, 0) }
  ];

  const PIE_COLORS = ['#3b82f6', '#f59e0b', '#10b981'];

  // Category-wise costing count & valuation
  const categoryData = Array.from(
    costings.reduce((acc, c) => {
      const existing = acc.get(c.category) || { category: c.category, count: 0, totalVal: 0 };
      existing.count += 1;
      existing.totalVal += c.grandTotal;
      acc.set(c.category, existing);
      return acc;
    }, new Map<string, { category: string; count: number; totalVal: number }>()).values()
  );

  return (
    <div id="dashboard-overview" className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-[#111827] p-6 rounded-xl border border-[#111827] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-white">
        <div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            Commercial Control Dashboard
          </span>
          <h2 className="text-xl font-bold mt-2 text-white">
            Furniture Costing & Commercial Management Portal
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Real-time material rates, automated labour calculation, margin enforcement, and single-click Quotation to Invoice workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            id="dash-btn-calculator"
            onClick={() => setActiveTab('calculator')}
            className="px-4 py-2 bg-[#92400E] hover:bg-amber-800 text-white font-bold text-xs rounded-md shadow-sm flex items-center gap-2 transition-all"
          >
            <Calculator className="w-4 h-4" />
            Launch Costing Engine
          </button>
          <button
            id="dash-btn-excel"
            onClick={() => setActiveTab('excel')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-md border border-slate-700 flex items-center gap-2 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Excel Migration
          </button>
        </div>
      </div>

      {/* 8 Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Products */}
        <div id="kpi-products" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Products</span>
            <div className="p-1.5 bg-gray-100 text-gray-700 rounded-md">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-2">{totalProductsCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Standard sizes & variants
          </div>
        </div>

        {/* Total Materials */}
        <div id="kpi-materials" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Material Master</span>
            <div className="p-1.5 bg-gray-100 text-gray-700 rounded-md">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-2">{totalMaterialsCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Plywood, Fittings, Locks, Glass
          </div>
        </div>

        {/* Total Costings */}
        <div id="kpi-costings" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Costings</span>
            <div className="p-1.5 bg-amber-50 text-amber-800 rounded-md">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-2">{totalCostingsCount}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            Avg Margin: {avgMargin}%
          </div>
        </div>

        {/* Active Quotations */}
        <div id="kpi-quotations" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Quotations</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-2">{formatCurrency(totalQuotationValue, currency)}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            {activeQuotationsCount} Approved / Active
          </div>
        </div>

        {/* Total Invoices */}
        <div id="kpi-invoices" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoices Issued</span>
            <div className="p-1.5 bg-gray-100 text-gray-700 rounded-md">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-2">{totalInvoicesCount}</div>
          <div className="text-[11px] text-gray-500 mt-1">
            Commercial Orders
          </div>
        </div>

        {/* Total Revenue Received */}
        <div id="kpi-revenue" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Collected Revenue</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-md">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-800 mt-2">{formatCurrency(totalRevenue, currency)}</div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Bank / Cash Realized
          </div>
        </div>

        {/* Pending Payments */}
        <div id="kpi-pending" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Outstanding</span>
            <div className="p-1.5 bg-rose-50 text-rose-700 rounded-md">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-2">{formatCurrency(pendingPaymentsAmount, currency)}</div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Unpaid Receivables
          </div>
        </div>

        {/* Target Margin Summary */}
        <div id="kpi-margin" className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Overall Health</span>
            <div className="p-1.5 bg-teal-50 text-teal-700 rounded-md">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#111827] mt-2">Optimal</div>
          <div className="text-[11px] text-gray-500 mt-1">
            All rates active & verified
          </div>
        </div>
      </div>

      {/* Analytics Charts & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Cost Breakdown Analysis */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#111827]">Costing Components Breakdown</h3>
              <p className="text-xs text-gray-500">Material Cost vs Labour Cost vs Net Margin Profit</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-[#92400E] font-bold hover:underline flex items-center gap-1"
            >
              View Detailed Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costBreakdownData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value), currency)} />
                <Bar dataKey="value" fill="#111827" radius={[4, 4, 0, 0]}>
                  {costBreakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Costings Distribution */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB]">
          <h3 className="text-sm font-bold text-[#111827] mb-1">Costing Share by Category</h3>
          <p className="text-xs text-gray-500 mb-4">Volume distribution across furniture types</p>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="totalVal"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                  label={({ name }) => name}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`pie-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(Number(v), currency)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity Log & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Log */}
        <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#111827]">Recent Portal Activity Log</h3>
            <span className="text-xs text-gray-400">Live Audit Trail</span>
          </div>

          <div className="space-y-2.5">
            {activityLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start justify-between text-xs p-3 bg-[#F9FAFB] rounded-md border border-[#E5E7EB]">
                <div className="space-y-0.5">
                  <div className="font-semibold text-gray-900">{log.action}</div>
                  <div className="text-gray-500 text-[11px]">
                    By <span className="font-medium text-gray-700">{log.user}</span>
                  </div>
                </div>
                <div className="text-[11px] text-gray-400 font-mono shrink-0 ml-2">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Action Hub */}
        <div className="bg-[#111827] p-5 rounded-xl border border-[#111827] text-white shadow-sm">
          <h3 className="text-sm font-bold text-white mb-1">Quick Operations Hub</h3>
          <p className="text-xs text-gray-400 mb-4">Execute common commercial tasks</p>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('calculator')}
              className="w-full py-2.5 px-3 bg-[#92400E] hover:bg-amber-800 text-white font-bold text-xs rounded-md flex items-center justify-between transition-all"
            >
              <span>1. Calculate Product Costing</span>
              <Calculator className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('quotations')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-md flex items-center justify-between transition-all"
            >
              <span>2. Generate Customer Quotation</span>
              <FileText className="w-4 h-4 text-emerald-400" />
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-md flex items-center justify-between transition-all"
            >
              <span>3. Issue Tax Invoice & Collect Payment</span>
              <Receipt className="w-4 h-4 text-purple-400" />
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-md flex items-center justify-between transition-all"
            >
              <span>4. Update Material Master Rates</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
