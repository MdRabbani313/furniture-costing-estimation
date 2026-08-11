import { MaterialItem, Product, CostingRecord, Customer, Quotation, Invoice, ActivityLog, RateHistoryEntry } from '../types';

export const initialMaterials: MaterialItem[] = [
  // Plywood
  { id: 'm-01', code: 'PLY-18-BWR', name: '18mm BWR Commercial Plywood (Gurjan Core)', category: 'Plywood', unit: 'SQFT', unitRate: 98, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-02', code: 'PLY-12-BWR', name: '12mm BWR Commercial Plywood', category: 'Plywood', unit: 'SQFT', unitRate: 72, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-03', code: 'PLY-06-BWR', name: '6mm Backing Commercial Plywood', category: 'Plywood', unit: 'SQFT', unitRate: 42, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-04', code: 'LAM-01-M', name: '1.0mm SF/Gloss Laminate Sheet (Off-white / Woodgrain)', category: 'Plywood', unit: 'SQFT', unitRate: 45, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-05', code: 'VEN-04-TEAK', name: '4mm Teak Natural Veneer', category: 'Plywood', unit: 'SQFT', unitRate: 140, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // Handles & Knobs
  { id: 'm-06', code: 'HDL-SS-200', name: 'SS 202 Concealed Profile Handle (200mm)', category: 'Handles & Knobs', unit: 'Piece', unitRate: 180, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-07', code: 'KNB-BRASS-30', name: 'Antique Brass Designer Knob (30mm)', category: 'Handles & Knobs', unit: 'Piece', unitRate: 95, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // Hinges & Channels
  { id: 'm-08', code: 'HNG-SOFT-0D', name: 'Soft-Close Auto 0-Crank Hinges (Hettich / Ebco)', category: 'Hinges & Channels', unit: 'Pair', unitRate: 240, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-09', code: 'CHN-TEL-18', name: '18-inch Telescopic Soft-Close Drawer Channel', category: 'Hinges & Channels', unit: 'Pair', unitRate: 420, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-10', code: 'CHN-UND-20', name: '20-inch Undermount Quadro Drawer Runner', category: 'Hinges & Channels', unit: 'Pair', unitRate: 850, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // Locks & Fittings
  { id: 'm-11', code: 'LCK-DRW-MULTI', name: 'Multi-Drawer Central Lock System', category: 'Locks & Fittings', unit: 'Piece', unitRate: 260, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-12', code: 'LCK-WDR-CAM', name: 'Computerized Cam Wardrobe Lock', category: 'Locks & Fittings', unit: 'Piece', unitRate: 190, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // PVC Patti
  { id: 'm-13', code: 'PVC-PAT-22x2', name: '22mm x 2mm Matching PVC Edgeband Tape', category: 'PVC Patti', unit: 'Feet', unitRate: 14, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // Glass & Mirror
  { id: 'm-14', code: 'GLS-MIR-05', name: '5mm Saint-Gobain Clear Mirror', category: 'Glass & Mirror', unit: 'SQFT', unitRate: 120, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-15', code: 'GLS-TNT-08', name: '8mm Toughened Tinted Glass', category: 'Glass & Mirror', unit: 'SQFT', unitRate: 210, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // Hydraulic & Cushion
  { id: 'm-16', code: 'HYD-BED-120', name: '120kg Heavy Duty Hydraulic Bed Pump Set', category: 'Hydraulic & Cushion', unit: 'Set', unitRate: 3400, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },
  { id: 'm-17', code: 'CSH-PU-40D', name: 'High Density 40D PU Foam (4 inch)', category: 'Hydraulic & Cushion', unit: 'SQFT', unitRate: 165, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // LED
  { id: 'm-18', code: 'LED-PRF-12V', name: '12V COB Warm White Profile Strip Light + Driver', category: 'LED & Electrical', unit: 'Meter', unitRate: 380, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // SS Pipe/Legs
  { id: 'm-19', code: 'LEG-SS-4IN', name: 'SS 304 Heavy Duty Tapered Leg (4 inch)', category: 'SS Pipe & Legs', unit: 'Piece', unitRate: 210, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' },

  // Bed Socket
  { id: 'm-20', code: 'HARD-BED-BRA', name: 'Heavy MS Bed Corner Bracket Socket Set', category: 'Bed Socket & Hardware', unit: 'Set', unitRate: 450, gstRate: 18, status: 'Active', lastUpdated: '2026-08-01' }
];

export const initialProducts: Product[] = [
  {
    id: 'p-01',
    code: 'PROD-BOXBED',
    name: 'Hydraulic Storage Box Bed',
    category: 'Box Bed',
    description: 'Heavy duty commercial plywood storage bed with German hydraulic lift-up mechanism and cushioned headboard.',
    defaultMarginPercent: 28,
    defaultLabourRatePerSqft: 65,
    status: 'Active',
    standardVariants: [
      { id: 'v-01', name: 'King Size (72" x 78" x 18")', dimensions: { width: 72, height: 78, depth: 18, unit: 'inches' }, sqftArea: 95 },
      { id: 'v-02', name: 'Queen Size (60" x 78" x 18")', dimensions: { width: 60, height: 78, depth: 18, unit: 'inches' }, sqftArea: 82 }
    ],
    costingTemplate: [
      { materialId: 'm-01', materialName: '18mm BWR Commercial Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 0.85', multiplier: 0.85 },
      { materialId: 'm-02', materialName: '12mm BWR Commercial Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 0.30', multiplier: 0.30 },
      { materialId: 'm-03', materialName: '6mm Backing Commercial Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 0.40', multiplier: 0.40 },
      { materialId: 'm-04', materialName: '1.0mm Laminate Sheet', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 0.90', multiplier: 0.90 },
      { materialId: 'm-16', materialName: '120kg Hydraulic Pump Set', category: 'Hydraulic & Cushion', defaultUnit: 'Set', quantityFormula: '1', multiplier: 1 },
      { materialId: 'm-20', materialName: 'Bed Corner Socket Set', category: 'Bed Socket & Hardware', defaultUnit: 'Set', quantityFormula: '1', multiplier: 1 },
      { materialId: 'm-13', materialName: '22mm PVC Edgeband', category: 'PVC Patti', defaultUnit: 'Feet', quantityFormula: 'sqft * 1.5', multiplier: 1.5 }
    ]
  },
  {
    id: 'p-02',
    code: 'PROD-WARDROBE',
    name: '3-Door Sliding Wardrobe with Mirror',
    category: 'Wardrobe',
    description: 'Floor-to-ceiling 3-door sliding wardrobe with soft-close channels, internal multi-drawers, hanging rods, and dress-up mirror.',
    defaultMarginPercent: 30,
    defaultLabourRatePerSqft: 75,
    status: 'Active',
    standardVariants: [
      { id: 'v-03', name: 'Standard 7ft x 8ft x 2ft', dimensions: { width: 84, height: 96, depth: 24, unit: 'inches' }, sqftArea: 140 },
      { id: 'v-04', name: 'Compact 6ft x 7ft x 2ft', dimensions: { width: 72, height: 84, depth: 24, unit: 'inches' }, sqftArea: 110 }
    ],
    costingTemplate: [
      { materialId: 'm-01', materialName: '18mm BWR Commercial Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 1.2', multiplier: 1.2 },
      { materialId: 'm-03', materialName: '6mm Backing Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 0.5', multiplier: 0.5 },
      { materialId: 'm-04', materialName: '1.0mm Laminate Sheet', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 1.3', multiplier: 1.3 },
      { materialId: 'm-09', materialName: '18-inch Telescopic Channels', category: 'Hinges & Channels', defaultUnit: 'Pair', quantityFormula: '4', multiplier: 4 },
      { materialId: 'm-06', materialName: 'SS Concealed Profile Handles', category: 'Handles & Knobs', defaultUnit: 'Piece', quantityFormula: '6', multiplier: 6 },
      { materialId: 'm-14', materialName: '5mm Clear Mirror', category: 'Glass & Mirror', defaultUnit: 'SQFT', quantityFormula: '18', multiplier: 18 }
    ]
  },
  {
    id: 'p-03',
    code: 'PROD-OFFDESK',
    name: 'Executive Office Table with Mobile Pedestal',
    category: 'Office Table',
    description: 'Modern executive office desk with dual side cable grommets, modesty panel, and 3-drawer lockable mobile pedestal.',
    defaultMarginPercent: 25,
    defaultLabourRatePerSqft: 60,
    status: 'Active',
    standardVariants: [
      { id: 'v-05', name: '6ft Executive Table (72" x 36" x 30")', dimensions: { width: 72, height: 30, depth: 36, unit: 'inches' }, sqftArea: 55 },
      { id: 'v-06', name: '5ft Manager Table (60" x 30" x 30")', dimensions: { width: 60, height: 30, depth: 30, unit: 'inches' }, sqftArea: 42 }
    ],
    costingTemplate: [
      { materialId: 'm-01', materialName: '18mm BWR Commercial Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 1.0', multiplier: 1.0 },
      { materialId: 'm-04', materialName: '1.0mm Laminate Sheet', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 1.1', multiplier: 1.1 },
      { materialId: 'm-09', materialName: '18-inch Telescopic Channel', category: 'Hinges & Channels', defaultUnit: 'Pair', quantityFormula: '3', multiplier: 3 },
      { materialId: 'm-11', materialName: 'Multi-Drawer Central Lock', category: 'Locks & Fittings', defaultUnit: 'Piece', quantityFormula: '1', multiplier: 1 },
      { materialId: 'm-19', materialName: 'SS Tapered Legs', category: 'SS Pipe & Legs', defaultUnit: 'Piece', quantityFormula: '4', multiplier: 4 }
    ]
  },
  {
    id: 'p-04',
    code: 'PROD-TVUNIT',
    name: 'Floating Console TV Unit with LED Light',
    category: 'TV Unit',
    description: 'Wall-mounted feature wall TV console panel with louvers, storage cabinets, and ambient COB LED lighting.',
    defaultMarginPercent: 32,
    defaultLabourRatePerSqft: 80,
    status: 'Active',
    standardVariants: [
      { id: 'v-07', name: 'Large 8ft Wall Unit', dimensions: { width: 96, height: 72, depth: 15, unit: 'inches' }, sqftArea: 75 }
    ],
    costingTemplate: [
      { materialId: 'm-01', materialName: '18mm BWR Commercial Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 0.9', multiplier: 0.9 },
      { materialId: 'm-05', materialName: '4mm Teak Natural Veneer', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 0.5', multiplier: 0.5 },
      { materialId: 'm-18', materialName: '12V COB Warm LED Light', category: 'LED & Electrical', defaultUnit: 'Meter', quantityFormula: '6', multiplier: 6 }
    ]
  },
  {
    id: 'p-05',
    code: 'PROD-MANDIR',
    name: 'Designer Wooden Pooja Mandir',
    category: 'Mandir',
    description: 'Intricately CNC carved wooden pooja ghar with drawer for incenses, LED backlit jaali, and bell sockets.',
    defaultMarginPercent: 35,
    defaultLabourRatePerSqft: 90,
    status: 'Active',
    standardVariants: [
      { id: 'v-08', name: '4ft Wall Hanging Mandir', dimensions: { width: 36, height: 48, depth: 18, unit: 'inches' }, sqftArea: 35 }
    ],
    costingTemplate: [
      { materialId: 'm-01', materialName: '18mm BWR Plywood', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 1.1', multiplier: 1.1 },
      { materialId: 'm-05', materialName: 'Teak Veneer', category: 'Plywood', defaultUnit: 'SQFT', quantityFormula: 'sqft * 1.0', multiplier: 1.0 },
      { materialId: 'm-18', materialName: '12V Warm LED Light', category: 'LED & Electrical', defaultUnit: 'Meter', quantityFormula: '3', multiplier: 3 }
    ]
  }
];

export const initialCostings: CostingRecord[] = [
  {
    id: 'c-101',
    costingNumber: 'COST-2026-001',
    productId: 'p-01',
    productName: 'Hydraulic Storage Box Bed',
    category: 'Box Bed',
    variantName: 'King Size (72" x 78" x 18")',
    quantity: 2,
    sqftTotal: 95,
    components: [
      { id: 'cc-1', materialId: 'm-01', materialName: '18mm BWR Commercial Plywood', category: 'Plywood', unit: 'SQFT', quantity: 80.75, appliedUnitRate: 98, totalCost: 7913.5 },
      { id: 'cc-2', materialId: 'm-02', materialName: '12mm BWR Commercial Plywood', category: 'Plywood', unit: 'SQFT', quantity: 28.5, appliedUnitRate: 72, totalCost: 2052 },
      { id: 'cc-3', materialId: 'm-03', materialName: '6mm Backing Commercial Plywood', category: 'Plywood', unit: 'SQFT', quantity: 38, appliedUnitRate: 42, totalCost: 1596 },
      { id: 'cc-4', materialId: 'm-04', materialName: '1.0mm Laminate Sheet', category: 'Plywood', unit: 'SQFT', quantity: 85.5, appliedUnitRate: 45, totalCost: 3847.5 },
      { id: 'cc-5', materialId: 'm-16', materialName: '120kg Hydraulic Pump Set', category: 'Hydraulic & Cushion', unit: 'Set', quantity: 1, appliedUnitRate: 3400, totalCost: 3400 },
      { id: 'cc-6', materialId: 'm-20', materialName: 'Bed Corner Socket Set', category: 'Bed Socket & Hardware', unit: 'Set', quantity: 1, appliedUnitRate: 450, totalCost: 450 }
    ],
    materialCostTotal: 19259,
    labourRatePerSqft: 65,
    labourCostTotal: 6175,
    wastagePercent: 5,
    wastageAmount: 1271.7,
    subtotalCost: 26705.7,
    marginPercent: 28,
    marginAmount: 7477.6,
    baseSellingPrice: 34183.3,
    gstPercent: 18,
    gstAmount: 6153,
    finalSellingPricePerUnit: 40336.3,
    grandTotal: 80672.6,
    status: 'Approved',
    createdAt: '2026-08-05',
    createdBy: 'Costing Lead - Rajesh',
    notes: 'Approved for Master Bedroom project'
  },
  {
    id: 'c-102',
    costingNumber: 'COST-2026-002',
    productId: 'p-02',
    productName: '3-Door Sliding Wardrobe with Mirror',
    category: 'Wardrobe',
    variantName: 'Standard 7ft x 8ft x 2ft',
    quantity: 1,
    sqftTotal: 140,
    components: [
      { id: 'cc-7', materialId: 'm-01', materialName: '18mm BWR Commercial Plywood', category: 'Plywood', unit: 'SQFT', quantity: 168, appliedUnitRate: 98, totalCost: 16464 },
      { id: 'cc-8', materialId: 'm-03', materialName: '6mm Backing Plywood', category: 'Plywood', unit: 'SQFT', quantity: 70, appliedUnitRate: 42, totalCost: 2940 },
      { id: 'cc-9', materialId: 'm-04', materialName: '1.0mm Laminate Sheet', category: 'Plywood', unit: 'SQFT', quantity: 182, appliedUnitRate: 45, totalCost: 8190 },
      { id: 'cc-10', materialId: 'm-09', materialName: '18-inch Telescopic Channels', category: 'Hinges & Channels', unit: 'Pair', quantity: 4, appliedUnitRate: 420, totalCost: 1680 },
      { id: 'cc-11', materialId: 'm-14', materialName: '5mm Clear Mirror', category: 'Glass & Mirror', unit: 'SQFT', quantity: 18, appliedUnitRate: 120, totalCost: 2160 }
    ],
    materialCostTotal: 31434,
    labourRatePerSqft: 75,
    labourCostTotal: 10500,
    wastagePercent: 5,
    wastageAmount: 2096.7,
    subtotalCost: 44030.7,
    marginPercent: 30,
    marginAmount: 13209.2,
    baseSellingPrice: 57239.9,
    gstPercent: 18,
    gstAmount: 10303.2,
    finalSellingPricePerUnit: 67543.1,
    grandTotal: 67543.1,
    status: 'Approved',
    createdAt: '2026-08-08',
    createdBy: 'Costing Lead - Rajesh'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-01',
    name: 'Anand Sharma',
    companyName: 'Sharma Interior Solutions',
    email: 'anand.sharma@sharmainteriors.com',
    phone: '+91 98765 43210',
    gstin: '07AAAAA0000A1Z5',
    billingAddress: 'Plot 42, Sector 18, Gurgaon',
    shippingAddress: 'Villa 12, DLF Phase 5, Gurgaon',
    city: 'Gurgaon',
    state: 'Haryana',
    createdAt: '2026-07-15'
  },
  {
    id: 'cust-02',
    name: 'Priya Verma',
    companyName: 'Verma & Associates Architects',
    email: 'priya@vermaarchitects.in',
    phone: '+91 98112 33445',
    gstin: '07BBBBB1111B2Z8',
    billingAddress: 'Level 3, Connaught Place',
    shippingAddress: 'Level 3, Connaught Place',
    city: 'New Delhi',
    state: 'Delhi',
    createdAt: '2026-07-20'
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: 'q-201',
    quotationNumber: 'QUO-2026-001',
    customerId: 'cust-01',
    customerName: 'Sharma Interior Solutions (Anand Sharma)',
    customerEmail: 'anand.sharma@sharmainteriors.com',
    customerPhone: '+91 98765 43210',
    customerGstin: '07AAAAA0000A1Z5',
    billingAddress: 'Plot 42, Sector 18, Gurgaon',
    date: '2026-08-06',
    validUntil: '2026-09-06',
    items: [
      {
        id: 'qi-1',
        costingId: 'c-101',
        productName: 'Hydraulic Storage Box Bed',
        description: 'King Size (72" x 78" x 18") with 120kg Hydraulic Pump Set and Gurjan Core Plywood',
        variantOrSize: 'King Size',
        quantity: 2,
        unitPrice: 34183.3,
        discountPercent: 5,
        netPrice: 32474.1,
        gstPercent: 18,
        totalAmount: 76638.9
      }
    ],
    subtotal: 68366.6,
    discountAmount: 3418.3,
    taxTotal: 11690.6,
    grandTotal: 76638.9,
    termsAndConditions: '1. 50% Advance along with Purchase Order.\n2. Delivery within 15 working days.\n3. Warranty of 5 years on Plywood and Hydraulic Mechanism.',
    status: 'Approved',
    createdBy: 'Sales Executive - Vikram'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-301',
    invoiceNumber: 'INV-2026-001',
    quotationId: 'q-201',
    customerId: 'cust-01',
    customerName: 'Sharma Interior Solutions (Anand Sharma)',
    customerPhone: '+91 98765 43210',
    customerGstin: '07AAAAA0000A1Z5',
    billingAddress: 'Plot 42, Sector 18, Gurgaon',
    invoiceDate: '2026-08-07',
    dueDate: '2026-08-22',
    items: [
      {
        id: 'qi-1',
        costingId: 'c-101',
        productName: 'Hydraulic Storage Box Bed',
        description: 'King Size (72" x 78" x 18") with 120kg Hydraulic Pump Set',
        variantOrSize: 'King Size',
        quantity: 2,
        unitPrice: 34183.3,
        discountPercent: 5,
        netPrice: 32474.1,
        gstPercent: 18,
        totalAmount: 76638.9
      }
    ],
    subtotal: 68366.6,
    discountTotal: 3418.3,
    taxTotal: 11690.6,
    grandTotal: 76638.9,
    paidAmount: 40000,
    outstandingBalance: 36638.9,
    paymentStatus: 'Partially Paid',
    createdBy: 'Accounts - Sangeeta',
    notes: 'Advance 50% received via Bank Transfer'
  }
];

export const initialActivityLogs: ActivityLog[] = [
  { id: 'al-1', timestamp: '2026-08-07 14:30', user: 'Sangeeta (Accounts)', role: 'accounts_user', action: 'Recorded Payment ₹40,000 for Invoice INV-2026-001', type: 'payment' },
  { id: 'al-2', timestamp: '2026-08-07 11:15', user: 'Vikram (Sales)', role: 'sales_user', action: 'Generated Invoice INV-2026-001 from Quotation QUO-2026-001', type: 'invoice' },
  { id: 'al-3', timestamp: '2026-08-06 16:45', user: 'Vikram (Sales)', role: 'sales_user', action: 'Created Quotation QUO-2026-001 for Sharma Interior Solutions', type: 'quotation' },
  { id: 'al-4', timestamp: '2026-08-05 10:20', user: 'Rajesh (Costing)', role: 'costing_user', action: 'Approved Costing COST-2026-001 for Hydraulic Storage Box Bed', type: 'costing' }
];

export const initialRateHistory: RateHistoryEntry[] = [
  { id: 'rh-1', materialId: 'm-01', materialName: '18mm BWR Commercial Plywood', oldRate: 92, newRate: 98, effectiveDate: '2026-08-01', changedBy: 'Rajesh (Costing Lead)', reason: 'Raw Timber Price Hike by Supplier' },
  { id: 'rh-2', materialId: 'm-16', materialName: '120kg Heavy Duty Hydraulic Bed Pump Set', oldRate: 3100, newRate: 3400, effectiveDate: '2026-08-01', changedBy: 'Rajesh (Costing Lead)', reason: 'Import duty revised' }
];
