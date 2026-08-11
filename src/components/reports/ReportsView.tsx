import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Download, PieChart as PieIcon, ShieldAlert } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { costings, materials, invoices, quotations, currency } = useApp();

  // Top Costly Materials in Costings
  const materialUsageMap = new Map<string, number>();
  costings.forEach((c) => {
    c.components.forEach((comp) => {
      const current = materialUsageMap.get(comp.materialName) || 0;
      materialUsageMap.set(comp.materialName, current + comp.totalCost);
    });
  });

  const topMaterialsData = Array.from(materialUsageMap.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Profit Margin per Product
  const marginData = costings.map((c) => ({
    name: c.productName,
    marginPercent: c.marginPercent,
    profitAmount: c.marginAmount
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div id="reports-analytics-view" className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Commercial Reports & Costing Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analytical insights into material cost drivers, category profit margins, quotation conversions, and outstanding aging
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Top Material Cost Drivers */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Top Material Budget Drivers</h3>
          <p className="text-xs text-slate-500 mb-4">Highest total cost items across all active costings</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMaterialsData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={130} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v), currency)} />
                <Bar dataKey="total" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Product Margin Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Target Margin % Realized by Product</h3>
          <p className="text-xs text-slate-500 mb-4">Commercial margin percentage across costing sheets</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marginData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="%" />
                <Tooltip />
                <Bar dataKey="marginPercent" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Outstanding Receivables Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Outstanding Receivables & Payment Status Report
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Invoice Date</th>
                <th className="p-3 text-right">Invoice Total</th>
                <th className="p-3 text-right">Collected</th>
                <th className="p-3 text-right">Balance Due</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="p-3 font-mono font-bold text-amber-600">{inv.invoiceNumber}</td>
                  <td className="p-3 font-bold text-slate-900">{inv.customerName}</td>
                  <td className="p-3 text-slate-600 font-mono">{inv.invoiceDate}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(inv.grandTotal, currency)}</td>
                  <td className="p-3 text-right font-mono text-emerald-600">{formatCurrency(inv.paidAmount, currency)}</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-600">{formatCurrency(inv.outstandingBalance, currency)}</td>
                  <td className="p-3 text-center font-bold text-[10px]">{inv.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
