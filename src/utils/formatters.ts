export const formatCurrency = (amount: number, currencySymbol: string = '₹'): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return `${currencySymbol}0`;
  return `${currencySymbol}${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  })}`;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Calculates surface area in SQFT based on Width x Height x Depth in inches/mm
 */
export const calculateFurnitureSqft = (
  width: number,
  height: number,
  depth: number,
  unit: 'inches' | 'mm' = 'inches'
): number => {
  let w = width;
  let h = height;
  let d = depth;

  if (unit === 'mm') {
    w = width / 25.4;
    h = height / 25.4;
    d = depth / 25.4;
  }

  // General surface area approximation formula for box/carcass furniture
  // Front/Back: 2 * (w * h)
  // Sides: 2 * (d * h)
  // Top/Bottom: 2 * (w * d)
  // Divide total sq inches by 144 to get SQFT, with a 0.6 factor for internal shelves/dividers
  const totalSqInches = (2 * (w * h) + 2 * (d * h) + 2 * (w * d));
  const sqft = (totalSqInches / 144) * 0.65;
  return Math.round(sqft * 10) / 10;
};

export const getRolePermissions = (role: string) => {
  switch (role) {
    case 'super_admin':
      return {
        canEditMaterials: true,
        canEditRates: true,
        canViewMargins: true,
        canEditMargins: true,
        canCreateQuotations: true,
        canCreateInvoices: true,
        canManageCustomers: true,
        canRecordPayments: true,
        canViewReports: true
      };
    case 'costing_user':
      return {
        canEditMaterials: true,
        canEditRates: true,
        canViewMargins: true,
        canEditMargins: true,
        canCreateQuotations: false,
        canCreateInvoices: false,
        canManageCustomers: false,
        canRecordPayments: false,
        canViewReports: true
      };
    case 'sales_user':
      return {
        canEditMaterials: false,
        canEditRates: false,
        canViewMargins: false,
        canEditMargins: false,
        canCreateQuotations: true,
        canCreateInvoices: true,
        canManageCustomers: true,
        canRecordPayments: false,
        canViewReports: false
      };
    case 'accounts_user':
      return {
        canEditMaterials: false,
        canEditRates: false,
        canViewMargins: true,
        canEditMargins: false,
        canCreateQuotations: false,
        canCreateInvoices: true,
        canManageCustomers: true,
        canRecordPayments: true,
        canViewReports: true
      };
    default:
      return {
        canEditMaterials: true,
        canEditRates: true,
        canViewMargins: true,
        canEditMargins: true,
        canCreateQuotations: true,
        canCreateInvoices: true,
        canManageCustomers: true,
        canRecordPayments: true,
        canViewReports: true
      };
  }
};
