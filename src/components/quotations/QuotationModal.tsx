import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quotation, QuotationItem, Customer, CostingRecord } from '../../types';
import { CustomerSelectOrAdd } from '../customers/CustomerSelectOrAddModal';
import { formatCurrency } from '../../utils/formatters';
import { FileText, Plus, Trash2, Save, X, Calculator } from 'lucide-react';

interface QuotationModalProps {
  quotationToEdit?: Quotation;
  initialCosting?: CostingRecord;
  onClose: () => void;
}

export const QuotationModal: React.FC<QuotationModalProps> = ({
  quotationToEdit,
  initialCosting,
  onClose
}) => {
  const { customers, addQuotation, updateQuotation, currency, costings } = useApp();

  // Initial Customer Selection
  const defaultCustomer = customers[0] || {
    id: 'cust-walkin',
    name: 'Walk-in Commercial Client',
    phone: '+91 98000 00000',
    email: 'client@woodcraft.com',
    billingAddress: 'Client Project Site'
  };

  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(() => {
    if (quotationToEdit) {
      const found = customers.find((c) => c.id === quotationToEdit.customerId);
      if (found) return found;
      return {
        id: quotationToEdit.customerId,
        name: quotationToEdit.customerName,
        phone: quotationToEdit.customerPhone,
        email: quotationToEdit.customerEmail || 'client@woodcraft.com',
        gstin: quotationToEdit.customerGstin,
        billingAddress: quotationToEdit.billingAddress,
        shippingAddress: quotationToEdit.billingAddress,
        city: 'Gurgaon',
        state: 'Haryana',
        createdAt: quotationToEdit.date
      };
    }
    return defaultCustomer;
  });

  // Quotation Header Fields
  const [date, setDate] = useState<string>(
    quotationToEdit ? quotationToEdit.date : new Date().toISOString().split('T')[0]
  );
  const [validUntil, setValidUntil] = useState<string>(
    quotationToEdit
      ? quotationToEdit.validUntil
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [terms, setTerms] = useState<string>(
    quotationToEdit
      ? quotationToEdit.termsAndConditions
      : '1. 50% Advance with order confirmation.\n2. 50% Balance before dispatch.\n3. Delivery within 14 working days.\n4. GST 18% extra as applicable.'
  );

  // Line Items Initial Setup
  const [items, setItems] = useState<QuotationItem[]>(() => {
    if (quotationToEdit) {
      return quotationToEdit.items;
    }
    if (initialCosting) {
      return [
        {
          id: `qi-${Date.now()}`,
          costingId: initialCosting.id,
          productName: initialCosting.productName,
          description: `Commercial Furniture Costing ${initialCosting.costingNumber} (${initialCosting.variantName})`,
          variantOrSize: initialCosting.variantName,
          quantity: initialCosting.quantity,
          unitPrice: initialCosting.baseSellingPrice,
          discountPercent: 0,
          netPrice: initialCosting.baseSellingPrice,
          gstPercent: initialCosting.gstPercent,
          totalAmount: initialCosting.grandTotal
        }
      ];
    }
    return [
      {
        id: `qi-${Date.now()}`,
        productName: 'Executive Office Table',
        description: 'Commercial Grade Plywood with Teak Veneer & Premium Locks',
        variantOrSize: '72" x 36" x 30"',
        quantity: 1,
        unitPrice: 28500,
        discountPercent: 0,
        netPrice: 28500,
        gstPercent: 18,
        totalAmount: 33630
      }
    ];
  });

  const [discountAmount, setDiscountAmount] = useState<number>(
    quotationToEdit ? quotationToEdit.discountAmount : 0
  );

  // Helper to add custom line item
  const handleAddItem = () => {
    const newItem: QuotationItem = {
      id: `qi-${Date.now()}-${Math.random()}`,
      productName: 'Custom Furniture Unit',
      description: 'Custom manufactured as per site specifications',
      variantOrSize: 'Standard',
      quantity: 1,
      unitPrice: 15000,
      discountPercent: 0,
      netPrice: 15000,
      gstPercent: 18,
      totalAmount: 17700
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Helper to add item directly from Costings library
  const handleAddFromCosting = (costingId: string) => {
    const costing = costings.find((c) => c.id === costingId);
    if (!costing) return;

    const newItem: QuotationItem = {
      id: `qi-${Date.now()}-${Math.random()}`,
      costingId: costing.id,
      productName: costing.productName,
      description: `Furniture Costing ${costing.costingNumber} (${costing.variantName})`,
      variantOrSize: costing.variantName,
      quantity: costing.quantity,
      unitPrice: costing.baseSellingPrice,
      discountPercent: 0,
      netPrice: costing.baseSellingPrice,
      gstPercent: costing.gstPercent,
      totalAmount: costing.grandTotal
    };
    setItems((prev) => [...prev, newItem]);
  };

  // Helper to update item
  const updateItem = (id: string, updates: Partial<QuotationItem>) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          const qty = updated.quantity || 1;
          const uPrice = updated.unitPrice || 0;
          const disc = updated.discountPercent || 0;
          const netPrice = uPrice * (1 - disc / 100);
          const subtotalLine = netPrice * qty;
          const gstAmountLine = subtotalLine * ((updated.gstPercent || 18) / 100);

          updated.netPrice = Math.round(netPrice);
          updated.totalAmount = Math.round(subtotalLine + gstAmountLine);
          return updated;
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Financial calculations
  const subtotal = items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
  const itemDiscountsTotal = items.reduce(
    (acc, i) => acc + (i.unitPrice * i.quantity * (i.discountPercent / 100)),
    0
  );
  const netSubtotal = subtotal - itemDiscountsTotal - discountAmount;
  const taxTotal = items.reduce((acc, i) => {
    const lineNet = (i.unitPrice * (1 - i.discountPercent / 100)) * i.quantity;
    return acc + (lineNet * (i.gstPercent / 100));
  }, 0);

  const grandTotal = Math.round(netSubtotal + taxTotal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const payload = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerEmail: selectedCustomer.email,
      customerPhone: selectedCustomer.phone,
      customerGstin: selectedCustomer.gstin,
      billingAddress: selectedCustomer.billingAddress,
      date,
      validUntil,
      items,
      subtotal,
      discountAmount: itemDiscountsTotal + discountAmount,
      taxTotal: Math.round(taxTotal),
      grandTotal,
      termsAndConditions: terms,
      status: quotationToEdit ? quotationToEdit.status : ('Sent' as const),
      createdBy: 'Sales / Commercial Lead'
    };

    if (quotationToEdit) {
      updateQuotation(quotationToEdit.id, payload);
    } else {
      addQuotation(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-gray-200 overflow-hidden text-xs">
        {/* Header */}
        <div className="bg-[#111827] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">
              {quotationToEdit ? `Edit Quotation ${quotationToEdit.quotationNumber}` : 'Prepare New Commercial Quotation'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Customer Selection & On-the-Fly Creation */}
          <CustomerSelectOrAdd
            selectedCustomerId={selectedCustomer.id}
            onSelectCustomer={(cust) => setSelectedCustomer(cust)}
          />

          {/* Section 2: Dates & Validity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Quotation Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md p-2 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Valid Until Date</label>
              <input
                type="date"
                required
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md p-2 font-medium"
              />
            </div>
          </div>

          {/* Section 3: Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h4 className="font-bold text-gray-900 text-sm">Quotation Line Items</h4>
              <div className="flex items-center gap-2">
                {costings.length > 0 && (
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleAddFromCosting(e.target.value);
                      e.target.value = '';
                    }}
                    className="bg-amber-50 text-amber-900 font-semibold border border-amber-300 rounded px-2.5 py-1 text-xs"
                  >
                    <option value="">+ Import Saved Costing...</option>
                    {costings.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.costingNumber} - {c.productName} ({formatCurrency(c.grandTotal, currency)})
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Custom Line
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <th className="p-2">Item Name & Description</th>
                    <th className="p-2 w-28">Variant / Size</th>
                    <th className="p-2 w-16 text-center">Qty</th>
                    <th className="p-2 w-24 text-right">Unit Price</th>
                    <th className="p-2 w-20 text-right">Disc %</th>
                    <th className="p-2 w-20 text-right">GST %</th>
                    <th className="p-2 w-28 text-right">Total</th>
                    <th className="p-2 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="p-2 space-y-1">
                        <input
                          type="text"
                          required
                          value={item.productName}
                          onChange={(e) => updateItem(item.id, { productName: e.target.value })}
                          className="w-full border border-gray-300 rounded px-2 py-1 font-bold"
                          placeholder="Product Name"
                        />
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, { description: e.target.value })}
                          className="w-full border border-gray-200 text-gray-600 rounded px-2 py-0.5 text-[11px]"
                          placeholder="Specifications / Description"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.variantOrSize}
                          onChange={(e) => updateItem(item.id, { variantOrSize: e.target.value })}
                          className="w-full border border-gray-300 rounded px-1.5 py-1 font-medium"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-12 text-center border border-gray-300 rounded px-1 py-1 font-bold"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-20 text-right border border-gray-300 rounded px-1 py-1 font-semibold"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={item.discountPercent}
                          onChange={(e) => updateItem(item.id, { discountPercent: parseFloat(e.target.value) || 0 })}
                          className="w-16 text-right border border-gray-300 rounded px-1 py-1"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <select
                          value={item.gstPercent}
                          onChange={(e) => updateItem(item.id, { gstPercent: parseFloat(e.target.value) })}
                          className="w-16 border border-gray-300 rounded px-1 py-1"
                        >
                          <option value={18}>18%</option>
                          <option value={12}>12%</option>
                          <option value={28}>28%</option>
                          <option value={0}>0%</option>
                        </select>
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(item.totalAmount, currency)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Totals Summary & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-200">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Terms & Conditions</label>
              <textarea
                rows={4}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 font-medium text-gray-800"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Base Price):</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Discounts:</span>
                <span className="font-mono font-bold text-emerald-600">-{formatCurrency(itemDiscountsTotal, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST Tax Total:</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(taxTotal, currency)}</span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between items-center text-sm font-extrabold text-gray-900">
                <span>Grand Total:</span>
                <span className="text-base font-mono text-[#92400E]">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md font-semibold text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#92400E] hover:bg-amber-800 text-white font-bold rounded-md shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {quotationToEdit ? 'Update Quotation' : 'Save & Issue Quotation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
