import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MaterialItem,
  Product,
  CostingRecord,
  Customer,
  Quotation,
  Invoice,
  PaymentRecord,
  UserRole,
  ActivityLog,
  RateHistoryEntry
} from '../types';
import {
  initialMaterials,
  initialProducts,
  initialCostings,
  initialCustomers,
  initialQuotations,
  initialInvoices,
  initialActivityLogs,
  initialRateHistory
} from '../data/initialData';
import { getRolePermissions } from '../utils/formatters';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Navigation & Role
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  permissions: ReturnType<typeof getRolePermissions>;
  currency: string;
  setCurrency: (c: string) => void;

  // Data Collections
  materials: MaterialItem[];
  products: Product[];
  costings: CostingRecord[];
  customers: Customer[];
  quotations: Quotation[];
  invoices: Invoice[];
  activityLogs: ActivityLog[];
  rateHistory: RateHistoryEntry[];

  // Toast
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Material Actions
  addMaterial: (item: Omit<MaterialItem, 'id' | 'lastUpdated'>) => void;
  updateMaterial: (id: string, updates: Partial<MaterialItem>, reason?: string) => void;
  deleteMaterial: (id: string) => void;

  // Product Actions
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Costing Actions
  addCosting: (costing: Omit<CostingRecord, 'id' | 'costingNumber' | 'createdAt'>) => CostingRecord;
  updateCosting: (id: string, updates: Partial<CostingRecord>) => void;
  deleteCosting: (id: string) => void;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;

  // Quotation Actions
  addQuotation: (quo: Omit<Quotation, 'id' | 'quotationNumber'>) => Quotation;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;

  // Invoice & Payment Actions
  addInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  recordPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'invoiceId'>) => void;

  // System Actions
  resetToSampleData: () => void;
  importBulkData: (materials: MaterialItem[], products: Product[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MATERIALS: 'furniture_portal_materials_v1',
  PRODUCTS: 'furniture_portal_products_v1',
  COSTINGS: 'furniture_portal_costings_v1',
  CUSTOMERS: 'furniture_portal_customers_v1',
  QUOTATIONS: 'furniture_portal_quotations_v1',
  INVOICES: 'furniture_portal_invoices_v1',
  LOGS: 'furniture_portal_logs_v1',
  RATES: 'furniture_portal_rates_v1',
  ROLE: 'furniture_portal_role_v1'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentRole, setCurrentRoleState] = useState<UserRole>('super_admin');
  const [currency, setCurrency] = useState<string>('₹');
  const [toast, setToast] = useState<Toast | null>(null);

  // Initialize state with localStorage or default mock data
  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
    return saved ? JSON.parse(saved) : initialMaterials;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [costings, setCostings] = useState<CostingRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COSTINGS);
    return saved ? JSON.parse(saved) : initialCostings;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [quotations, setQuotations] = useState<Quotation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
    return saved ? JSON.parse(saved) : initialQuotations;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
    return saved ? JSON.parse(saved) : initialInvoices;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
    return saved ? JSON.parse(saved) : initialActivityLogs;
  });

  const [rateHistory, setRateHistory] = useState<RateHistoryEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RATES);
    return saved ? JSON.parse(saved) : initialRateHistory;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COSTINGS, JSON.stringify(costings));
  }, [costings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));
  }, [quotations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rateHistory));
  }, [rateHistory]);

  const permissions = getRolePermissions(currentRole);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3500);
  };

  const addLog = (action: string, type: ActivityLog['type']) => {
    const newLog: ActivityLog = {
      id: `al-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: currentRole === 'super_admin' ? 'Super Admin' : currentRole.replace('_', ' ').toUpperCase(),
      role: currentRole,
      action,
      type
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    showToast(`Switched user role to ${role.replace('_', ' ').toUpperCase()}`, 'info');
  };

  // Material Actions
  const addMaterial = (item: Omit<MaterialItem, 'id' | 'lastUpdated'>) => {
    const newItem: MaterialItem = {
      ...item,
      id: `m-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setMaterials((prev) => [newItem, ...prev]);
    addLog(`Added material ${newItem.name} (${newItem.code})`, 'material');
    showToast(`Material ${newItem.name} created successfully!`);
  };

  const updateMaterial = (id: string, updates: Partial<MaterialItem>, reason?: string) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          if (updates.unitRate !== undefined && updates.unitRate !== m.unitRate) {
            // Track rate history entry
            const historyEntry: RateHistoryEntry = {
              id: `rh-${Date.now()}`,
              materialId: m.id,
              materialName: m.name,
              oldRate: m.unitRate,
              newRate: updates.unitRate,
              effectiveDate: new Date().toISOString().split('T')[0],
              changedBy: currentRole,
              reason: reason || 'Rate revision in Master'
            };
            setRateHistory((prevHistory) => [historyEntry, ...prevHistory]);
            addLog(`Updated rate for ${m.name}: ${m.unitRate} -> ${updates.unitRate}`, 'material');
          }
          return {
            ...m,
            ...updates,
            lastUpdated: new Date().toISOString().split('T')[0]
          };
        }
        return m;
      })
    );
    showToast(`Material updated!`);
  };

  const deleteMaterial = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast(`Material removed from master database.`);
  };

  // Product Actions
  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prod,
      id: `p-${Date.now()}`
    };
    setProducts((prev) => [newProd, ...prev]);
    addLog(`Added product ${newProd.name} (${newProd.code})`, 'product');
    showToast(`Product ${newProd.name} created!`);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    showToast(`Product details updated!`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Product removed.`);
  };

  // Costing Actions
  const addCosting = (costingData: Omit<CostingRecord, 'id' | 'costingNumber' | 'createdAt'>): CostingRecord => {
    const count = costings.length + 1;
    const costingNumber = `COST-2026-${count.toString().padStart(3, '0')}`;
    const newCosting: CostingRecord = {
      ...costingData,
      id: `c-${Date.now()}`,
      costingNumber,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCostings((prev) => [newCosting, ...prev]);
    addLog(`Calculated Costing ${costingNumber} for ${newCosting.productName}`, 'costing');
    showToast(`Costing record ${costingNumber} saved successfully!`);
    return newCosting;
  };

  const updateCosting = (id: string, updates: Partial<CostingRecord>) => {
    setCostings((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast(`Costing updated.`);
  };

  const deleteCosting = (id: string) => {
    setCostings((prev) => prev.filter((c) => c.id !== id));
    showToast(`Costing deleted.`);
  };

  // Customer Actions
  const addCustomer = (custData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast(`Customer ${newCust.name} saved.`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast(`Customer profile updated.`);
  };

  // Quotation Actions
  const addQuotation = (quoData: Omit<Quotation, 'id' | 'quotationNumber'>): Quotation => {
    const count = quotations.length + 1;
    const quotationNumber = `QUO-2026-${count.toString().padStart(3, '0')}`;
    const newQuotation: Quotation = {
      ...quoData,
      id: `q-${Date.now()}`,
      quotationNumber
    };
    setQuotations((prev) => [newQuotation, ...prev]);
    addLog(`Generated Quotation ${quotationNumber} for ${newQuotation.customerName}`, 'quotation');
    showToast(`Quotation ${quotationNumber} created!`);
    return newQuotation;
  };

  const updateQuotationStatus = (id: string, status: Quotation['status']) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    showToast(`Quotation status changed to ${status}`);
  };

  // Invoice Actions
  const addInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const count = invoices.length + 1;
    const invoiceNumber = `INV-2026-${count.toString().padStart(3, '0')}`;
    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    addLog(`Issued Tax Invoice ${invoiceNumber} for ${newInvoice.customerName}`, 'invoice');
    showToast(`Invoice ${invoiceNumber} generated!`);
    return newInvoice;
  };

  const recordPayment = (invoiceId: string, paymentData: Omit<PaymentRecord, 'id' | 'invoiceId'>) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = inv.paidAmount + paymentData.amount;
          const newOutstanding = Math.max(0, inv.grandTotal - newPaid);
          let newStatus: Invoice['paymentStatus'] = inv.paymentStatus;

          if (newOutstanding === 0) newStatus = 'Paid';
          else if (newPaid > 0) newStatus = 'Partially Paid';

          addLog(`Recorded payment of ₹${paymentData.amount} for Invoice ${inv.invoiceNumber}`, 'payment');
          return {
            ...inv,
            paidAmount: newPaid,
            outstandingBalance: newOutstanding,
            paymentStatus: newStatus
          };
        }
        return inv;
      })
    );
    showToast(`Payment recorded successfully!`);
  };

  const resetToSampleData = () => {
    setMaterials(initialMaterials);
    setProducts(initialProducts);
    setCostings(initialCostings);
    setCustomers(initialCustomers);
    setQuotations(initialQuotations);
    setInvoices(initialInvoices);
    setActivityLogs(initialActivityLogs);
    setRateHistory(initialRateHistory);
    localStorage.clear();
    showToast(`System reset to clean sample database!`, 'info');
  };

  const importBulkData = (newMaterials: MaterialItem[], newProducts: Product[]) => {
    if (newMaterials.length > 0) {
      setMaterials((prev) => [...newMaterials, ...prev]);
    }
    if (newProducts.length > 0) {
      setProducts((prev) => [...newProducts, ...prev]);
    }
    addLog(`Bulk imported ${newMaterials.length} materials & ${newProducts.length} products from Excel`, 'material');
    showToast(`Imported ${newMaterials.length} materials and ${newProducts.length} products!`);
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentRole,
        setCurrentRole,
        permissions,
        currency,
        setCurrency,
        materials,
        products,
        costings,
        customers,
        quotations,
        invoices,
        activityLogs,
        rateHistory,
        toast,
        showToast,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        addProduct,
        updateProduct,
        deleteProduct,
        addCosting,
        updateCosting,
        deleteCosting,
        addCustomer,
        updateCustomer,
        addQuotation,
        updateQuotationStatus,
        addInvoice,
        recordPayment,
        resetToSampleData,
        importBulkData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
