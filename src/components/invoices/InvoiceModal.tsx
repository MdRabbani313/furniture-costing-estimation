import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceItem, Customer } from '../../types';
import { CustomerSelectOrAdd } from '../customers/CustomerSelectOrAddModal';
import { formatCurrency } from '../../utils/formatters';
import { Receipt, Plus, Trash2, Save, X } from 'lucide-react';

interface InvoiceModalProps {
  invoiceToEdit?: Invoice;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoiceToEdit,
  onClose
}) => {
  const { customers, addInvoice, updateInvoice, currency } = useApp();

  const defaultCustomer = customers[0] || {
    id: 'cust-walkin',
    name: 'Walk-in Commercial Client',
    phone: '+91 98000 00000',
    email: 'client@woodcraft.com',
    billingAddress: 'Client Project Site'
  };

  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(() => {
    if (invoiceToEdit) {
      const found = customers.find((c) => c.id === invoiceToEdit.customerId);
      if (found) return found;
      return {
        id: invoiceToEdit.customerId,
        name: invoiceToEdit.customerName,
        phone: invoiceToEdit.customerPhone,
        email: 'client@woodcraft.com',
        gstin: invoiceToEdit.customerGstin,
        billingAddress: invoiceToEdit.billingAddress,
        shippingAddress: invoiceToEdit.billingAddress,
        city: 'Gurgaon',
        state: 'Haryana',
        createdAt: invoiceToEdit.invoiceDate
      };
    }
    return defaultCustomer;
  });

  const [invoiceDate, setInvoiceDate] = useState<string>(
    invoiceToEdit ? invoiceToEdit.invoiceDate : new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    invoiceToEdit
      ? invoiceToEdit.dueDate
      : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (invoiceToEdit) return invoiceToEdit.items;
    return [
      {
        id: `ii-${Date.now()}`,
        productName: 'Custom Commercial Modular Furniture',
        description: 'Complete Modular Workstations with Teak Veneer finish',
        variantOrSize: 'Standard',
        quantity: 1,
        unitPrice: 45000,
        discountPercent: 0,
        netPrice: 45000,
        gstPercent: 18,
        totalAmount: 53100
      }
    ];
  });

  const [discountTotal, setDiscountTotal] = useState<number>(
    invoiceToEdit ? invoiceToEdit.discountTotal : 0
  );

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `ii-${Date.now()}-${Math.random()}`,
      productName: 'Custom Furniture Unit',
      description: 'Manufactured as per design specifications',
      variantOrSize: 'Custom',
      quantity: 1,
      unitPrice: 20000,
      discountPercent: 0,
      netPrice: 20000,
      gstPercent: 18,
      totalAmount: 23600
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
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
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const itemDiscounts = items.reduce(
    (acc, i) => acc + i.unitPrice * i.quantity * (i.discountPercent / 100),
    0
  );
  const taxTotal = items.reduce((acc, i) => {
    const lineNet = i.unitPrice * (1 - i.discountPercent / 100) * i.quantity;
    return acc + lineNet * (i.gstPercent / 100);
  }, 0);

  const grandTotal = Math.round(subtotal - itemDiscounts - discountTotal + taxTotal);
  const paidAmount = invoiceToEdit ? invoiceToEdit.paidAmount : 0;
  const outstandingBalance = Math.max(0, grandTotal - paidAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const payload = {
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.phone,
      customerGstin: selectedCustomer.gstin,
      billingAddress: selectedCustomer.billingAddress,
      invoiceDate,
      dueDate,
      items,
      subtotal,
      taxTotal: Math.round(taxTotal),
      discountTotal: itemDiscounts + discountTotal,
      grandTotal,
      paidAmount,
      outstandingBalance,
      paymentStatus: (paidAmount >= grandTotal ? 'Paid' : paidAmount > 0 ? 'Partially Paid' : 'Unpaid') as Invoice['paymentStatus'],
      createdBy: 'Sales / Billing Manager'
    };

    if (invoiceToEdit) {
      updateInvoice(invoiceToEdit.id, payload);
    } else {
      addInvoice(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 shadow-2xl border border-gray-200 overflow-hidden text-xs">
        <div className="bg-[#111827] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-white">
              {invoiceToEdit ? `Edit Tax Invoice ${invoiceToEdit.invoiceNumber}` : 'Create Direct Tax Invoice'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Customer Selection or Quick Addition */}
          <CustomerSelectOrAdd
            selectedCustomerId={selectedCustomer.id}
            onSelectCustomer={(cust) => setSelectedCustomer(cust)}
          />

          {/* Invoice Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Invoice Date</label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md p-2 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md p-2 font-medium"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h4 className="font-bold text-gray-900 text-sm">Tax Invoice Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Item Line
              </button>
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
                          placeholder="Description / Specs"
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

          {/* Totals Summary */}
          <div className="flex justify-end pt-3 border-t border-gray-200">
            <div className="w-full sm:w-80 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discounts:</span>
                <span className="font-mono font-bold text-emerald-600">-{formatCurrency(itemDiscounts, currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST Tax Total:</span>
                <span className="font-mono font-bold text-gray-800">{formatCurrency(taxTotal, currency)}</span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between items-center font-extrabold text-gray-900 text-sm">
                <span>Grand Total:</span>
                <span className="text-base font-mono text-[#92400E]">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>
          </div>

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
              {invoiceToEdit ? 'Update Invoice' : 'Generate & Issue Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
