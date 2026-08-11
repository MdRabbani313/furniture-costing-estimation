import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { CustomerDetailModal } from './CustomerDetailModal';
import { Search, Plus, Eye, Edit2, Trash2, User, Phone, Mail, MapPin } from 'lucide-react';

export const CustomerList: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, invoices } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Customer Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm)
  );

  const openAddModal = () => {
    setEditingCustomer(null);
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setGstin('');
    setBillingAddress('');
    setShowModal(true);
  };

  const openEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setName(cust.name);
    setCompanyName(cust.companyName || '');
    setEmail(cust.email);
    setPhone(cust.phone);
    setGstin(cust.gstin || '');
    setBillingAddress(cust.billingAddress);
    setShowModal(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        name,
        companyName,
        email,
        phone,
        gstin,
        billingAddress,
        shippingAddress: billingAddress
      });
    } else {
      addCustomer({
        name,
        companyName,
        email,
        phone,
        gstin,
        billingAddress,
        shippingAddress: billingAddress,
        city: 'Gurgaon',
        state: 'Haryana'
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, custName: string) => {
    if (window.confirm(`Are you sure you want to delete customer ${custName}?`)) {
      deleteCustomer(id);
    }
  };

  return (
    <div id="customer-management-view" className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Customer & Company Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage client profiles, GSTIN registrations, and customer transaction ledgers
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Customer Profile
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, company, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((cust) => {
          const custInvoices = invoices.filter((inv) => inv.customerId === cust.id || inv.customerName.includes(cust.name));
          const outstanding = custInvoices.reduce((a, inv) => a + inv.outstandingBalance, 0);

          return (
            <div key={cust.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{cust.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{cust.companyName || 'Private Client'}</p>
                </div>
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <User className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{cust.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{cust.billingAddress}</span>
                </div>
                {cust.gstin && (
                  <div className="text-[11px] font-mono font-bold text-amber-700 pt-0.5">
                    GSTIN: {cust.gstin}
                  </div>
                )}
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Outstanding Balance:</span>
                <span className={`font-mono font-bold ${outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹{outstanding.toLocaleString()}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCustomer(cust)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" /> Ledger
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(cust)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    title="Edit Customer Profile"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cust.id, cust.name)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                    title="Delete Customer Profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer Profile'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Firm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sharma Interior Solutions"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="client@woodcraft.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="07AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Address</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Plot 42, Sector 18, Gurgaon"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-sm"
                >
                  {editingCustomer ? 'Update Profile' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
