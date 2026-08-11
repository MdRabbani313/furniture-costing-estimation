import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import { User, Plus, Check, Search, Phone, Mail, MapPin, Building, ShieldCheck } from 'lucide-react';

interface CustomerSelectOrAddProps {
  selectedCustomerId: string;
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerSelectOrAdd: React.FC<CustomerSelectOrAddProps> = ({
  selectedCustomerId,
  onSelectCustomer
}) => {
  const { customers, addCustomer } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Customer Form State
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [billingAddress, setBillingAddress] = useState('');

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.phone.includes(searchTerm)
  );

  const handleCreateInlineCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust = addCustomer({
      name: name.trim(),
      companyName: companyName.trim(),
      phone: phone.trim() || '+91 98000 00000',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@client.com`,
      gstin: gstin.trim(),
      billingAddress: billingAddress.trim() || 'Client Site / Address',
      shippingAddress: billingAddress.trim() || 'Client Site / Address',
      city: 'Gurgaon',
      state: 'Haryana'
    });

    onSelectCustomer(newCust);
    setIsAddingNew(false);
    // Reset form
    setName('');
    setCompanyName('');
    setPhone('');
    setEmail('');
    setGstin('');
    setBillingAddress('');
  };

  return (
    <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-[#E5E7EB]">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-700" />
          Customer / Bill-To Party
        </label>

        {!isAddingNew && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> + Add Custom Customer
          </button>
        )}
      </div>

      {isAddingNew ? (
        <form onSubmit={handleCreateInlineCustomer} className="p-3.5 bg-white rounded-lg border border-amber-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-amber-900">Quick Create Customer Profile</span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Customer Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Company / Firm Name</label>
              <input
                type="text"
                placeholder="e.g. Sharma Architects & Interior"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Phone Number</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Email Address</label>
              <input
                type="email"
                placeholder="client@woodcraft.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">GSTIN Number (Optional)</label>
              <input
                type="text"
                placeholder="07AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono uppercase font-bold focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Billing Address</label>
              <input
                type="text"
                placeholder="Plot 42, Sector 18, Gurgaon"
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-gray-100">
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#92400E] hover:bg-amber-800 text-white font-bold text-xs rounded shadow-sm flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" /> Save & Select Customer
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          {/* Dropdown Select */}
          <select
            value={selectedCustomerId}
            onChange={(e) => {
              const cust = customers.find((c) => c.id === e.target.value);
              if (cust) onSelectCustomer(cust);
            }}
            className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="" disabled>-- Select Existing Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.companyName ? `(${c.companyName})` : ''} - {c.phone}
              </option>
            ))}
          </select>

          {/* Selected Customer Details Preview Box */}
          {selectedCustomer && (
            <div className="p-3 bg-white rounded-lg border border-gray-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{selectedCustomer.name}</span>
                {selectedCustomer.companyName && (
                  <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-medium">
                    {selectedCustomer.companyName}
                  </span>
                )}
              </div>
              <div className="text-gray-600 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
                <span>📞 {selectedCustomer.phone}</span>
                <span>✉️ {selectedCustomer.email}</span>
                {selectedCustomer.gstin && <span className="font-mono font-semibold text-amber-800">GST: {selectedCustomer.gstin}</span>}
              </div>
              <div className="text-[11px] text-gray-500 truncate pt-0.5 border-t border-gray-100">
                📍 {selectedCustomer.billingAddress}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
