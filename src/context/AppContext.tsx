import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  MaterialItem,
  Product,
  CostingRecord,
  Customer,
  Quotation,
  Invoice,
  PaymentRecord,
  ActivityLog,
  RateHistoryEntry,
  UserRole,
  UnitMasterItem,
  ManufacturingRates,
  BoardRateMaster,
  ArbudaCostingMaster,
  CutListPanel
} from '../types';
import {
  initialMaterials,
  initialProducts,
  initialCostings,
  initialCustomers,
  initialQuotations,
  initialInvoices,
  initialActivityLogs,
  initialRateHistory,
  initialUnits,
  initialManufacturingRates,
  initialArbudaCostings
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

  // Unit Master & Manufacturing Rates
  units: UnitMasterItem[];
  manufacturingRates: ManufacturingRates;
  arbudaCostings: ArbudaCostingMaster[];
  activeArbudaCostingId: string | null;
  setActiveArbudaCostingId: (id: string | null) => void;

  // CutList Transfer
  cutListTransferPlanks: CutListPanel[] | null;
  setCutListTransferPlanks: (planks: CutListPanel[] | null) => void;

  // Toast
  toast: Toast | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;

  // Unit Master Actions
  addUnit: (unit: Omit<UnitMasterItem, 'id'>) => void;
  updateUnit: (id: string, updates: Partial<UnitMasterItem>) => void;
  deleteUnit: (id: string) => void;

  // Manufacturing Rates Actions
  updateManufacturingRates: (rates: Partial<ManufacturingRates>) => void;
  addBoardRate: (board: Omit<BoardRateMaster, 'id'>) => void;
  updateBoardRate: (id: string, updates: Partial<BoardRateMaster>) => void;
  deleteBoardRate: (id: string) => void;

  // Arbuda Costing Master Actions
  addArbudaCosting: (costing: Omit<ArbudaCostingMaster, 'id' | 'createdAt' | 'updatedAt'>) => ArbudaCostingMaster;
  updateArbudaCosting: (id: string, updates: Partial<ArbudaCostingMaster>) => void;
  deleteArbudaCosting: (id: string) => void;

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
  deleteCustomer: (id: string) => void;

  // Quotation Actions
  addQuotation: (quo: Omit<Quotation, 'id' | 'quotationNumber'>) => Quotation;
  updateQuotation: (id: string, updates: Partial<Quotation>) => void;
  updateQuotationStatus: (id: string, status: Quotation['status']) => void;
  deleteQuotation: (id: string) => void;
  convertQuotationToInvoice: (quotationId: string) => Invoice | null;

  // Invoice & Payment Actions
  addInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  recordPayment: (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'invoiceId'>) => void;

  // System Actions
  resetToSampleData: () => void;
  importBulkData: (materials: MaterialItem[], products: Product[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MATERIALS: 'arbuda_materials_v3',
  PRODUCTS: 'arbuda_products_v3',
  COSTINGS: 'arbuda_costings_v3',
  CUSTOMERS: 'arbuda_customers_v3',
  QUOTATIONS: 'arbuda_quotations_v3',
  INVOICES: 'arbuda_invoices_v3',
  LOGS: 'arbuda_logs_v3',
  RATES: 'arbuda_rates_v3',
  ROLE: 'arbuda_role_v3',
  UNITS: 'arbuda_units_v3',
  MFG_RATES: 'arbuda_mfg_rates_v3',
  ARBUDA_COSTING_MASTER: 'arbuda_costing_master_v3'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('costing_master');
  const [currentRole, setCurrentRoleState] = useState<UserRole>('super_admin');
  const [currency, setCurrency] = useState<string>('₹');
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeArbudaCostingId, setActiveArbudaCostingId] = useState<string | null>('arb-cost-01');
  const [cutListTransferPlanks, setCutListTransferPlanks] = useState<CutListPanel[] | null>(null);

  // Initialize Units Master (10+ units)
  const [units, setUnits] = useState<UnitMasterItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UNITS);
    return saved ? JSON.parse(saved) : initialUnits;
  });

  // Manufacturing Rates (Per Min cutting, assembly, per inch edge bending, board rates)
  const [manufacturingRates, setManufacturingRates] = useState<ManufacturingRates>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MFG_RATES);
    return saved ? JSON.parse(saved) : initialManufacturingRates;
  });

  // Arbuda Costing Master Sheets
  const [arbudaCostings, setArbudaCostings] = useState<ArbudaCostingMaster[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ARBUDA_COSTING_MASTER);
    return saved ? JSON.parse(saved) : initialArbudaCostings;
  });

  // Collections
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

  // Persistence
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  }, [units]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MFG_RATES, JSON.stringify(manufacturingRates));
  }, [manufacturingRates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ARBUDA_COSTING_MASTER, JSON.stringify(arbudaCostings));
  }, [arbudaCostings]);

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

  // Unit Master Actions
  const addUnit = (unit: Omit<UnitMasterItem, 'id'>) => {
    const newUnit: UnitMasterItem = {
      ...unit,
      id: `u-${Date.now()}`
    };
    setUnits((prev) => [...prev, newUnit]);
    addLog(`Created unit: ${newUnit.name} (${newUnit.code})`, 'material');
    showToast(`Unit ${newUnit.code} added to master!`);
  };

  const updateUnit = (id: string, updates: Partial<UnitMasterItem>) => {
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    showToast(`Unit updated successfully.`);
  };

  const deleteUnit = (id: string) => {
    setUnits((prev) => prev.filter((u) => u.id !== id));
    showToast(`Unit removed from master.`);
  };

  // Manufacturing Rates Actions
  const updateManufacturingRates = (updates: Partial<ManufacturingRates>) => {
    setManufacturingRates((prev) => ({ ...prev, ...updates }));
    showToast(`Manufacturing & Labour Rates updated!`);
    addLog(`Updated manufacturing & labour time rates`, 'costing');
  };

  const addBoardRate = (board: Omit<BoardRateMaster, 'id'>) => {
    const newBoard: BoardRateMaster = {
      ...board,
      id: `br-${Date.now()}`
    };
    setManufacturingRates((prev) => ({
      ...prev,
      boardRates: [...prev.boardRates, newBoard]
    }));
    showToast(`Board rate ${newBoard.name} added!`);
  };

  const updateBoardRate = (id: string, updates: Partial<BoardRateMaster>) => {
    setManufacturingRates((prev) => ({
      ...prev,
      boardRates: prev.boardRates.map((b) => (b.id === id ? { ...b, ...updates } : b))
    }));
    showToast(`Board rate updated.`);
  };

  const deleteBoardRate = (id: string) => {
    setManufacturingRates((prev) => ({
      ...prev,
      boardRates: prev.boardRates.filter((b) => b.id !== id)
    }));
    showToast(`Board rate removed.`);
  };

  // Arbuda Costing Master Actions
  const addArbudaCosting = (costingData: Omit<ArbudaCostingMaster, 'id' | 'createdAt' | 'updatedAt'>): ArbudaCostingMaster => {
    const newCosting: ArbudaCostingMaster = {
      ...costingData,
      id: `arb-cost-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setArbudaCostings((prev) => [newCosting, ...prev]);
    setActiveArbudaCostingId(newCosting.id);
    addLog(`Created Costing Sheet for ${newCosting.modelName} (${newCosting.modelCode})`, 'costing');
    showToast(`Costing sheet ${newCosting.modelName} created!`);
    return newCosting;
  };

  const updateArbudaCosting = (id: string, updates: Partial<ArbudaCostingMaster>) => {
    setArbudaCostings((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              ...updates,
              updatedAt: new Date().toISOString().split('T')[0]
            }
          : c
      )
    );
    showToast(`Costing sheet updated.`);
  };

  const deleteArbudaCosting = (id: string) => {
    setArbudaCostings((prev) => prev.filter((c) => c.id !== id));
    if (activeArbudaCostingId === id) {
      setActiveArbudaCostingId(arbudaCostings.length > 1 ? arbudaCostings[0].id : null);
    }
    showToast(`Costing sheet deleted.`);
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
    showToast(`Costing record updated!`);
  };

  const deleteCosting = (id: string) => {
    setCostings((prev) => prev.filter((c) => c.id !== id));
    showToast(`Costing record deleted.`);
  };

  // Customer Actions
  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers((prev) => [newCust, ...prev]);
    showToast(`Customer ${newCust.name} added!`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast(`Customer updated.`);
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    showToast(`Customer deleted.`);
  };

  // Quotation Actions
  const addQuotation = (quoData: Omit<Quotation, 'id' | 'quotationNumber'>): Quotation => {
    const count = quotations.length + 1;
    const quotationNumber = `QUO-2026-${count.toString().padStart(3, '0')}`;
    const newQuo: Quotation = {
      ...quoData,
      id: `quo-${Date.now()}`,
      quotationNumber
    };
    setQuotations((prev) => [newQuo, ...prev]);
    addLog(`Created Quotation ${quotationNumber} for ${newQuo.customerName}`, 'quotation');
    showToast(`Quotation ${quotationNumber} generated!`);
    return newQuo;
  };

  const updateQuotation = (id: string, updates: Partial<Quotation>) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
    showToast(`Quotation updated!`);
  };

  const updateQuotationStatus = (id: string, status: Quotation['status']) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, status } : q)));
    showToast(`Quotation status changed to ${status}`);
  };

  const deleteQuotation = (id: string) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    showToast(`Quotation deleted.`);
  };

  const convertQuotationToInvoice = (quotationId: string): Invoice | null => {
    const quo = quotations.find((q) => q.id === quotationId);
    if (!quo) return null;

    const count = invoices.length + 1;
    const invoiceNumber = `INV-2026-${count.toString().padStart(3, '0')}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      quotationId: quo.id,
      customerId: quo.customerId,
      customerName: quo.customerName,
      customerPhone: quo.customerPhone,
      customerGstin: quo.customerGstin,
      billingAddress: quo.billingAddress,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      items: quo.items,
      subtotal: quo.subtotal,
      discountTotal: quo.discountAmount,
      taxTotal: quo.taxTotal,
      grandTotal: quo.grandTotal,
      paidAmount: 0,
      outstandingBalance: quo.grandTotal,
      paymentStatus: 'Unpaid',
      createdBy: currentRole,
      notes: `Converted from Quotation ${quo.quotationNumber}`
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    updateQuotationStatus(quo.id, 'Converted');
    addLog(`Converted Quotation ${quo.quotationNumber} to Invoice ${invoiceNumber}`, 'invoice');
    showToast(`Quotation ${quo.quotationNumber} converted to Invoice ${invoiceNumber}!`);
    return newInvoice;
  };

  // Invoice & Payment Actions
  const addInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const count = invoices.length + 1;
    const invoiceNumber = `INV-2026-${count.toString().padStart(3, '0')}`;
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      invoiceNumber
    };
    setInvoices((prev) => [newInv, ...prev]);
    addLog(`Created Invoice ${invoiceNumber} for ${newInv.customerName}`, 'invoice');
    showToast(`Invoice ${invoiceNumber} created!`);
    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv)));
    showToast(`Invoice updated!`);
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    showToast(`Invoice deleted.`);
  };

  const recordPayment = (invoiceId: string, payment: Omit<PaymentRecord, 'id' | 'invoiceId'>) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          const newPaid = Number((inv.paidAmount + payment.amount).toFixed(2));
          const newOutstanding = Math.max(0, Number((inv.grandTotal - newPaid).toFixed(2)));
          let newStatus: Invoice['paymentStatus'] = 'Partially Paid';
          if (newPaid >= inv.grandTotal) newStatus = 'Paid';
          if (newPaid === 0) newStatus = 'Unpaid';

          addLog(`Recorded payment of ${currency}${payment.amount} for Invoice ${inv.invoiceNumber}`, 'payment');

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
    setUnits(initialUnits);
    setManufacturingRates(initialManufacturingRates);
    setArbudaCostings(initialArbudaCostings);
    localStorage.clear();
    showToast(`Arbuda Steel Industries database refreshed to default masters!`, 'info');
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
        units,
        manufacturingRates,
        arbudaCostings,
        activeArbudaCostingId,
        setActiveArbudaCostingId,
        cutListTransferPlanks,
        setCutListTransferPlanks,
        toast,
        showToast,
        addUnit,
        updateUnit,
        deleteUnit,
        updateManufacturingRates,
        addBoardRate,
        updateBoardRate,
        deleteBoardRate,
        addArbudaCosting,
        updateArbudaCosting,
        deleteArbudaCosting,
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
        deleteCustomer,
        addQuotation,
        updateQuotation,
        updateQuotationStatus,
        deleteQuotation,
        convertQuotationToInvoice,
        addInvoice,
        updateInvoice,
        deleteInvoice,
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
