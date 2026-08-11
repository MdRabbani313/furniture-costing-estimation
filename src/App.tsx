import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { CostingCalculator } from './components/costing/CostingCalculator';
import { CostingList } from './components/costing/CostingList';
import { ProductList } from './components/products/ProductList';
import { MaterialMaster } from './components/materials/MaterialMaster';
import { RatesAndLabour } from './components/materials/RatesAndLabour';
import { QuotationList } from './components/quotations/QuotationList';
import { InvoiceList } from './components/invoices/InvoiceList';
import { CustomerList } from './components/customers/CustomerList';
import { ExcelMigrationModal } from './components/migration/ExcelMigrationModal';
import { ReportsView } from './components/reports/ReportsView';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toast } = useApp();

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'calculator':
        return <CostingCalculator />;
      case 'costings':
        return <CostingList />;
      case 'products':
        return <ProductList />;
      case 'materials':
        return <MaterialMaster />;
      case 'rates':
        return <RatesAndLabour />;
      case 'quotations':
        return <QuotationList />;
      case 'invoices':
        return <InvoiceList />;
      case 'customers':
        return <CustomerList />;
      case 'excel':
        return <ExcelMigrationModal />;
      case 'reports':
        return <ReportsView />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans text-[#111827]">
      <Header />

      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1600px] mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {renderTab()}
        </main>
      </div>

      {/* Global Toast Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-[#111827] text-white text-xs font-semibold rounded-lg shadow-lg border border-slate-700 animate-bounce">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400" />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
