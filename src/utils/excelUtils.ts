import * as XLSX from 'xlsx';
import { MaterialItem, Product, CostingRecord, MaterialCategory, MaterialUnit, ProductCategory } from '../types';

export interface ExcelImportResult {
  materials: MaterialItem[];
  products: Product[];
  errors: string[];
  summary: {
    materialsCount: number;
    productsCount: number;
  };
}

/**
 * Downloads a pre-formatted Excel template for furniture costing data migration
 */
export const downloadExcelMigrationTemplate = () => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Product & Costing Templates
  const sheet1Data = [
    ['Product Code', 'Product Name', 'Category', 'Description', 'Default Margin %', 'Labour Rate / SQFT', 'Status'],
    ['PROD-BED-01', 'Custom Storage Bed', 'Box Bed', 'Solid plywood box bed with storage drawers', 28, 65, 'Active'],
    ['PROD-DRS-01', 'Dressing Table with LED Mirror', 'Dressing Table', 'Modern vanity table with pull-out drawers and LED ring', 30, 70, 'Active'],
    ['PROD-SHOE-01', '6-Tier Shoe Rack Cabinet', 'Shoe Rack', 'Ventilated shoe cabinet with louvers and top seat', 25, 55, 'Active']
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  XLSX.utils.book_append_sheet(wb, ws1, 'Products & Costings');

  // Sheet 2: Material & Item Rates Master
  const sheet2Data = [
    ['Material Code', 'Item Name', 'Category', 'Unit', 'Unit Rate (₹)', 'GST Rate %', 'Status'],
    ['PLY-18-BWR', '18mm BWR Commercial Plywood', 'Plywood', 'SQFT', 98, 18, 'Active'],
    ['PLY-12-BWR', '12mm BWR Commercial Plywood', 'Plywood', 'SQFT', 72, 18, 'Active'],
    ['HDL-SS-150', '150mm SS Brushed Satin Handle', 'Handles & Knobs', 'Piece', 110, 18, 'Active'],
    ['HNG-SOFT-01', 'Soft-Close Concealed Hinge', 'Hinges & Channels', 'Pair', 220, 18, 'Active'],
    ['CHN-SOFT-18', '18-inch Soft Close Channel', 'Hinges & Channels', 'Pair', 400, 18, 'Active'],
    ['PVC-PAT-22', '22mm PVC Edgeband Tape', 'PVC Patti', 'Feet', 12, 18, 'Active']
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  XLSX.utils.book_append_sheet(wb, ws2, 'Material Rates Master');

  // Sheet 3: Documentation & Instructions
  const sheet3Data = [
    ['Furniture Portal Migration Guide'],
    ['1. Sheet 1 contains Products and Category Costing parameters.'],
    ['2. Sheet 2 contains all Material items, Units (SQFT, Piece, Pair, Feet, Meter, Set), and Rates.'],
    ['3. Upload this file in the Excel Data Migration section to import into the Web Portal.']
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
  XLSX.utils.book_append_sheet(wb, ws3, 'Migration Instructions');

  XLSX.writeFile(wb, 'Furniture_Costing_Migration_Template.xlsx');
};

/**
 * Parses an uploaded Excel file and converts Sheet 1 and Sheet 2 into structured material and product items
 */
export const parseUploadedExcelFile = async (file: File): Promise<ExcelImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedMaterials: MaterialItem[] = [];
        const importedProducts: Product[] = [];
        const errors: string[] = [];

        // Parse Sheet 2 (Material Master) if available
        const sheet2Name = workbook.SheetNames.find(s => s.toLowerCase().includes('material') || s.toLowerCase().includes('item') || s.includes('Sheet 2') || s.includes('2'));
        const targetSheet2 = sheet2Name ? workbook.Sheets[sheet2Name] : workbook.Sheets[workbook.SheetNames[1] || workbook.SheetNames[0]];

        if (targetSheet2) {
          const jsonSheet2 = XLSX.utils.sheet_to_json<any>(targetSheet2, { header: 1 });
          // Skip header row
          for (let i = 1; i < jsonSheet2.length; i++) {
            const row = jsonSheet2[i];
            if (!row || !row[1]) continue; // Name required

            const code = row[0] || `MAT-IMP-${i}`;
            const name = String(row[1]).trim();
            const category = (row[2] || 'Other Accessories') as MaterialCategory;
            const unit = (row[3] || 'SQFT') as MaterialUnit;
            const unitRate = parseFloat(row[4]) || 0;
            const gstRate = parseFloat(row[5]) || 18;
            const status = row[6] === 'Discontinued' ? 'Discontinued' : 'Active';

            importedMaterials.push({
              id: `mat-imp-${Date.now()}-${i}`,
              code,
              name,
              category,
              unit,
              unitRate,
              gstRate,
              status,
              lastUpdated: new Date().toISOString().split('T')[0]
            });
          }
        }

        // Parse Sheet 1 (Products) if available
        const sheet1Name = workbook.SheetNames.find(s => s.toLowerCase().includes('product') || s.toLowerCase().includes('costing') || s.includes('Sheet 1') || s.includes('1'));
        const targetSheet1 = sheet1Name ? workbook.Sheets[sheet1Name] : workbook.Sheets[workbook.SheetNames[0]];

        if (targetSheet1) {
          const jsonSheet1 = XLSX.utils.sheet_to_json<any>(targetSheet1, { header: 1 });
          for (let i = 1; i < jsonSheet1.length; i++) {
            const row = jsonSheet1[i];
            if (!row || !row[1]) continue;

            const code = row[0] || `PROD-IMP-${i}`;
            const name = String(row[1]).trim();
            const category = (row[2] || 'Custom Furniture') as ProductCategory;
            const description = row[3] || 'Imported product template from Excel';
            const defaultMarginPercent = parseFloat(row[4]) || 25;
            const defaultLabourRatePerSqft = parseFloat(row[5]) || 60;
            const status = row[6] === 'Draft' || row[6] === 'Archived' ? row[6] : 'Active';

            importedProducts.push({
              id: `prod-imp-${Date.now()}-${i}`,
              code,
              name,
              category,
              description,
              defaultMarginPercent,
              defaultLabourRatePerSqft,
              status,
              standardVariants: [
                {
                  id: `var-imp-${i}`,
                  name: 'Standard Variant',
                  dimensions: { width: 72, height: 78, depth: 18, unit: 'inches' },
                  sqftArea: 80
                }
              ],
              costingTemplate: []
            });
          }
        }

        resolve({
          materials: importedMaterials,
          products: importedProducts,
          errors,
          summary: {
            materialsCount: importedMaterials.length,
            productsCount: importedProducts.length
          }
        });
      } catch (err: any) {
        resolve({
          materials: [],
          products: [],
          errors: [`Failed to parse Excel file: ${err?.message || 'Unknown format'}`],
          summary: { materialsCount: 0, productsCount: 0 }
        });
      }
    };

    reader.onerror = () => {
      resolve({
        materials: [],
        products: [],
        errors: ['File reading error'],
        summary: { materialsCount: 0, productsCount: 0 }
      });
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Export full system database to an Excel Workbook
 */
export const exportSystemDataToExcel = (
  materials: MaterialItem[],
  products: Product[],
  costings: CostingRecord[]
) => {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Products
  const productsRows = products.map(p => ({
    Code: p.code,
    Name: p.name,
    Category: p.category,
    Description: p.description,
    MarginPercent: p.defaultMarginPercent,
    LabourRatePerSqft: p.defaultLabourRatePerSqft,
    Status: p.status
  }));
  const ws1 = XLSX.utils.json_to_sheet(productsRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Products');

  // Sheet 2: Material Master
  const materialsRows = materials.map(m => ({
    Code: m.code,
    Name: m.name,
    Category: m.category,
    Unit: m.unit,
    UnitRate: m.unitRate,
    GSTRate: m.gstRate,
    Status: m.status,
    LastUpdated: m.lastUpdated
  }));
  const ws2 = XLSX.utils.json_to_sheet(materialsRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Material Rates Master');

  // Sheet 3: Costings History
  const costingsRows = costings.map(c => ({
    CostingNumber: c.costingNumber,
    Product: c.productName,
    Variant: c.variantName,
    Quantity: c.quantity,
    SQFT: c.sqftTotal,
    MaterialCost: c.materialCostTotal,
    LabourCost: c.labourCostTotal,
    Subtotal: c.subtotalCost,
    MarginAmount: c.marginAmount,
    SellingPricePerUnit: c.finalSellingPricePerUnit,
    GrandTotal: c.grandTotal,
    Status: c.status,
    Date: c.createdAt,
    CreatedBy: c.createdBy
  }));
  const ws3 = XLSX.utils.json_to_sheet(costingsRows);
  XLSX.utils.book_append_sheet(wb, ws3, 'Costing History');

  XLSX.writeFile(wb, `Furniture_Portal_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
