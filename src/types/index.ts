export type UserRole = 'super_admin' | 'costing_user' | 'sales_user' | 'accounts_user';

export interface RolePermissions {
  canEditMaterials: boolean;
  canEditRates: boolean;
  canViewMargins: boolean;
  canEditMargins: boolean;
  canCreateQuotations: boolean;
  canCreateInvoices: boolean;
  canManageCustomers: boolean;
  canRecordPayments: boolean;
  canViewReports: boolean;
}

export type MaterialCategory = 
  | 'Plywood'
  | 'Handles & Knobs'
  | 'Hinges & Channels'
  | 'Locks & Fittings'
  | 'PVC Patti'
  | 'Glass & Mirror'
  | 'Hydraulic & Cushion'
  | 'LED & Electrical'
  | 'SS Pipe & Legs'
  | 'Bed Socket & Hardware'
  | 'Other Accessories';

export type MaterialUnit = 'SQFT' | 'Piece' | 'Pair' | 'Meter' | 'Feet' | 'Set' | 'Roll' | 'KG' | 'Box';

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  unitRate: number; // rate in INR/USD
  gstRate: number; // e.g. 18 for 18%
  status: 'Active' | 'Discontinued';
  lastUpdated: string; // ISO date
  updatedBy?: string;
}

export interface RateHistoryEntry {
  id: string;
  materialId: string;
  materialName: string;
  oldRate: number;
  newRate: number;
  effectiveDate: string;
  changedBy: string;
  reason?: string;
}

export type ProductCategory = 
  | 'Box Bed'
  | 'Wardrobe'
  | 'Office Table'
  | 'Study Table'
  | 'Dressing Table'
  | 'Shoe Rack'
  | 'TV Unit'
  | 'Deewan'
  | 'Mandir'
  | 'Custom Furniture';

export interface ProductVariant {
  id: string;
  name: string; // e.g. King Size, Queen Size, 3-Door
  dimensions: {
    width: number; // in inches or mm
    height: number;
    depth: number;
    unit: 'inches' | 'mm';
  };
  sqftArea: number; // Calculated default surface area
}

export interface ProductCostingTemplateComponent {
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  defaultUnit: MaterialUnit;
  quantityFormula: string; // e.g. "sqft * 1.1" or "4"
  multiplier: number; // default multiplier per sqft or fixed quantity
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  description: string;
  defaultMarginPercent: number; // e.g. 25
  defaultLabourRatePerSqft: number;
  standardVariants: ProductVariant[];
  costingTemplate: ProductCostingTemplateComponent[];
  status: 'Active' | 'Draft' | 'Archived';
  imageUrl?: string;
}

export interface CostingComponentItem {
  id: string;
  materialId: string;
  materialName: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  quantity: number;
  appliedUnitRate: number; // Rate snapshot at time of costing
  totalCost: number; // quantity * appliedUnitRate
}

export interface CostingRecord {
  id: string;
  costingNumber: string; // e.g. COST-2026-001
  productId: string;
  productName: string;
  category: ProductCategory;
  variantName: string;
  customDimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: 'inches' | 'mm';
  };
  quantity: number; // Batch batch qty
  sqftTotal: number;
  
  // Costing Breakdown
  components: CostingComponentItem[];
  materialCostTotal: number;
  
  labourRatePerSqft: number;
  labourCostTotal: number;
  
  wastagePercent: number; // e.g. 5%
  wastageAmount: number;
  
  subtotalCost: number; // Material + Labour + Wastage
  
  marginPercent: number; // e.g. 25%
  marginAmount: number;
  
  baseSellingPrice: number; // subtotal + margin
  gstPercent: number; // e.g. 18%
  gstAmount: number;
  
  finalSellingPricePerUnit: number;
  grandTotal: number; // finalSellingPricePerUnit * batch quantity
  
  status: 'Approved' | 'Draft' | 'Quoted';
  createdAt: string;
  createdBy: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  gstin?: string;
  billingAddress: string;
  shippingAddress: string;
  city: string;
  state: string;
  createdAt: string;
}

export interface QuotationItem {
  id: string;
  costingId?: string;
  productName: string;
  description: string;
  variantOrSize: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  netPrice: number;
  gstPercent: number;
  totalAmount: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. QUO-2026-001
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerGstin?: string;
  billingAddress: string;
  date: string; // YYYY-MM-DD
  validUntil: string;
  items: QuotationItem[];
  subtotal: number;
  discountAmount: number;
  taxTotal: number;
  grandTotal: number;
  termsAndConditions: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Converted';
  createdBy: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  date: string;
  amount: number;
  method: 'UPI' | 'Bank Transfer' | 'Cheque' | 'Cash' | 'Card';
  referenceNo?: string;
  recordedBy: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-001
  quotationId?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerGstin?: string;
  billingAddress: string;
  invoiceDate: string;
  dueDate: string;
  items: QuotationItem[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paidAmount: number;
  outstandingBalance: number;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';
  createdBy: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  type: 'costing' | 'quotation' | 'invoice' | 'material' | 'product' | 'payment';
}
