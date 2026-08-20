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

export type MaterialUnit = string;

export type UnitCategory = 'Area' | 'Length' | 'Volume' | 'Weight' | 'Count' | 'Sheet';

export interface UnitMasterItem {
  id: string;
  code: string; // e.g. SQFT, SQM, MM, NOS
  name: string; // e.g. Square Feet, Square Meter
  symbol: string; // e.g. sq.ft, sq.m, mm, pcs
  category: UnitCategory;
  baseConversionFactor: number; // multiplier to base unit in category
  isDefault?: boolean;
  description?: string;
}

export interface BoardRateMaster {
  id: string;
  name: string; // e.g. ACTION TESSA, RATE 18MM GREEN LAM- HMR, RATE 18MM PLB
  ratePerSqft: number; // e.g. 90, 110, 33
  thicknessMm: number;
  grade?: string;
}

export interface ManufacturingRates {
  cuttingRatePerMin: number; // e.g. 8.00 INR/min
  labourRatePerMin: number; // e.g. 5.00 INR/min
  edgeBendingRatePerInch: number; // e.g. 1.00 INR/inch
  dailyLabourWage: number; // e.g. 600 INR
  workingHoursPerDay: number; // e.g. 8 hrs
  dailyMachineCost: number; // e.g. 1000 INR
  boardWastagePercent: number; // e.g. 5%
  defaultGstPercent: number; // e.g. 18%
  boardRates: BoardRateMaster[];
}

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

export type InvoiceItem = QuotationItem;

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

// ARBUDA STEEL INDUSTRIES EXCEL SPREADSHEET PLANK-BY-PLANK BOM TYPES
export type PlankItemType = 'ASSEMBLY' | 'PLB' | 'PURCHASE' | 'FABRICATION' | 'HARDWARE';

export interface PlankCostingRow {
  id: string;
  srNo: number;
  partCode: string; // e.g. ARBUDA-ASSLY-01, PLANK-1, ARB-PUR-03
  description: string; // e.g. MAIN ASSEMBLY, TOP, BOTTOM, 5MM WOOD SCREW, HINGES
  totQty: number;
  type: PlankItemType;
  material: string; // e.g. RATE 18MM PLB, ACTION TESSA 90, RATE 18MM GREEN LAM- HMR
  thick: number; // in mm, e.g. 18
  widthInches: number; // width in inches
  lengthInches: number; // length in inches
  areaSqFt: number; // (width * length) / 144
  totAreaSqFt: number; // areaSqFt * totQty
  rawMaterialCost: number; // totAreaSqFt * BoardRate
  cuttingTimeMins: number; // cutting time in mins
  cuttingCost: number; // cuttingTimeMins * cuttingRatePerMin * totQty
  edgeBendingWidthWise: number; // count of width edges to bend (0, 1, 2)
  edgeBendingLengthWise: number; // count of length edges to bend (0, 1, 2)
  totalEdgeBendingLengthInches: number; // (width * widthWise + length * lengthWise) * totQty
  edgeBendingCost: number; // totalEdgeBendingLengthInches * edgeBendingRatePerInch
  purchaseRate: number; // for purchase / hardware items
  purchaseCost: number; // purchaseRate * totQty
  nosOfLabours: number;
  labourTimeMins: number;
  assemblyCost: number; // nosOfLabours * labourTimeMins * labourRatePerMin
  basicCost: number; // rawMaterialCost + cuttingCost + edgeBendingCost + purchaseCost + assemblyCost
  profitMarginPercent: number; // e.g. 15%
  profitMarginAmount: number;
  sellingPrice: number; // basicCost + profitMarginAmount
}

export interface ArbudaCostingMaster {
  id: string;
  modelCode: string; // e.g. ARB-CUP-7830
  modelName: string; // e.g. 78X30 CUPBOARD
  category: ProductCategory;
  dimensions: {
    width: number;
    height: number;
    depth: number;
    unit: 'inches' | 'mm';
  };
  rows: PlankCostingRow[];
  cuttingRatePerMin: number;
  labourRatePerMin: number;
  edgeBendingRatePerInch: number;
  
  // Summary Aggregates
  totalRawMaterialCost: number;
  totalCuttingCost: number;
  totalEdgeBendingCost: number;
  totalPurchaseCost: number;
  totalAssemblyCost: number;
  totalBasicCost: number;
  overallMarginPercent: number; // e.g. 15%
  totalProfitMarginAmount: number;
  finalOfferPrice: number; // Basic + Margin
  gstPercent: number; // 18%
  gstAmount: number;
  totalWithGst: number;
  
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// CUTLIST OPTIMIZER 2D SHEET PACKING TYPES (https://www.cutlistoptimizer.com/)
export interface CutListPanel {
  id: string;
  name: string; // e.g. "PLANK-1 TOP", "DOOR-1"
  length: number; // in inches or mm
  width: number; // in inches or mm
  quantity: number;
  material: string; // e.g. "18mm PLB", "Greenlam HMR"
  canRotate: boolean; // Grain direction constraint
  edgeBending: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
  color?: string;
  priority?: number;
}

export interface CutListStock {
  id: string;
  name: string; // e.g. "Standard 8x4 Sheet (96x48 in)"
  length: number;
  width: number;
  quantity: number;
  material: string;
  costPerSheet: number;
}

export interface CutListOptions {
  kerfThickness: number; // Blade thickness (e.g. 3mm or 0.125")
  trimMargin: number; // Edge trim on stock sheet (e.g. 0.25")
  allowRotation: boolean;
  cutPreference: 'minimal_waste' | 'guillotine_length' | 'guillotine_width';
  labelsOnPanels: boolean;
  showDimensions: boolean;
}

export interface CutListPlacedPanel {
  panelId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  length: number;
  rotated: boolean;
  material: string;
  color: string;
  edgeBending: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
}

export interface CutListWasteRect {
  x: number;
  y: number;
  width: number;
  length: number;
  area: number;
}

export interface CutListCutLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cutIndex: number;
  isGuillotine: boolean;
}

export interface CutListSheetLayout {
  sheetIndex: number;
  stockSheet: CutListStock;
  placedPanels: CutListPlacedPanel[];
  wasteRectangles: CutListWasteRect[];
  cutLines: CutListCutLine[];
  usedArea: number;
  wasteArea: number;
  efficiencyPercent: number;
  totalCutsCount: number;
}

export interface CutListResult {
  totalStockSheetsUsed: number;
  totalPlacedPanels: number;
  totalPanelsRequested: number;
  unplacedPanels: { name: string; width: number; length: number; count: number }[];
  overallEfficiencyPercent: number;
  totalUsedAreaSqft: number;
  totalWasteAreaSqft: number;
  totalCutsCount: number;
  totalSheetCost: number;
  sheetLayouts: CutListSheetLayout[];
  calculatedAt: string;
}
