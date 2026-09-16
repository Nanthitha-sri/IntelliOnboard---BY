import React, { useState } from 'react';
import {
  ALLOWED_IMPLEMENTATION_TYPES,
  ALLOWED_SIZES,
  ALLOWED_STATUSES,
  ALLOWED_REGIONS,
} from '../../data/customerWorkbookData.js';

export const AddCustomerModal = ({ isOpen, onClose, onCreateCustomer }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerCode: '',
    jpowerId: '',
    primarySme: '',
    secondarySme: '',
    implementationType: 'New Implementation',
    size: 'Medium',
    status: 'In Progress',
    mscDss: 'MSC + DSS',
    cloudRegion: 'Azure Region - US2',
    version: 'V2025.4',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer Name is required';
    }
    if (!formData.customerCode.trim()) {
      newErrors.customerCode = 'Customer Code is required';
    }
    if (!formData.jpowerId.trim()) {
      newErrors.jpowerId = 'JPower ID is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Trigger creation
    onCreateCustomer(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-lg shadow-2xl border border-[#CBD5E1] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#004B87] to-[#0072CE] text-white">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px]">post_add</span>
            <div>
              <h3 className="font-bold text-base leading-tight">Add New Customer Worksheet</h3>
              <p className="text-xs text-white/80">
                Initializes a dedicated Technical Details sheet with blank DEV, TEST, and PROD configurations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Informational Callout */}
        <div className="px-6 py-2.5 bg-[#F0F9FF] border-b border-[#BAE6FD] text-xs text-[#0369A1] flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] shrink-0 text-[#0284C7]">info</span>
          <span>
            The newly created worksheet will adopt the standard Excel workbook layout with empty fields for DEV, TEST, and PROD.
            No server names or passwords will be duplicated.
          </span>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="e.g. Customer 16"
                className={`w-full h-9 px-3 text-xs border rounded focus:outline-none focus:ring-1 transition-all ${
                  errors.customerName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50'
                    : 'border-[#CBD5E1] focus:border-[#004B87] focus:ring-[#004B87] bg-white'
                }`}
                autoFocus
              />
              {errors.customerName && (
                <p className="text-[11px] text-red-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Customer Code */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Customer Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.customerCode}
                onChange={(e) => handleChange('customerCode', e.target.value.toUpperCase())}
                placeholder="e.g. CST019"
                className={`w-full h-9 px-3 text-xs font-mono border rounded focus:outline-none focus:ring-1 transition-all uppercase ${
                  errors.customerCode
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50'
                    : 'border-[#CBD5E1] focus:border-[#004B87] focus:ring-[#004B87] bg-white'
                }`}
              />
              {errors.customerCode && (
                <p className="text-[11px] text-red-500 mt-1">{errors.customerCode}</p>
              )}
            </div>

            {/* JPower ID */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                JPower ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.jpowerId}
                onChange={(e) => handleChange('jpowerId', e.target.value)}
                placeholder="e.g. JPW-2026-4401-CST"
                className={`w-full h-9 px-3 text-xs font-mono border rounded focus:outline-none focus:ring-1 transition-all ${
                  errors.jpowerId
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/50'
                    : 'border-[#CBD5E1] focus:border-[#004B87] focus:ring-[#004B87] bg-white'
                }`}
              />
              {errors.jpowerId && (
                <p className="text-[11px] text-red-500 mt-1">{errors.jpowerId}</p>
              )}
            </div>

            {/* Implementation Type */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Implementation Type
              </label>
              <select
                value={formData.implementationType}
                onChange={(e) => handleChange('implementationType', e.target.value)}
                className="w-full h-9 px-3 text-xs border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white cursor-pointer"
              >
                {ALLOWED_IMPLEMENTATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary Onboarding SME */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Primary Onboarding SME
              </label>
              <input
                type="text"
                value={formData.primarySme}
                onChange={(e) => handleChange('primarySme', e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full h-9 px-3 text-xs border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white"
              />
            </div>

            {/* Secondary Onboarding SME */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Secondary Onboarding SME
              </label>
              <input
                type="text"
                value={formData.secondarySme}
                onChange={(e) => handleChange('secondarySme', e.target.value)}
                placeholder="e.g. Elena Rostova"
                className="w-full h-9 px-3 text-xs border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white"
              />
            </div>

            {/* T-Shirt / Size */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                T-Shirt / Size
              </label>
              <select
                value={formData.size}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full h-9 px-3 text-xs border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white cursor-pointer"
              >
                {ALLOWED_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full h-9 px-3 text-xs border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white cursor-pointer"
              >
                {ALLOWED_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* MSC / DSS */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">MSC / DSS</label>
              <input
                type="text"
                value={formData.mscDss}
                onChange={(e) => handleChange('mscDss', e.target.value)}
                placeholder="e.g. MSC + DSS"
                className="w-full h-9 px-3 text-xs border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white"
              />
            </div>

            {/* Cloud Region */}
            <div>
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Cloud Region
              </label>
              <select
                value={formData.cloudRegion}
                onChange={(e) => handleChange('cloudRegion', e.target.value)}
                className="w-full h-9 px-3 text-xs border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white cursor-pointer"
              >
                {ALLOWED_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Initial Baseline Version */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#334155] mb-1">
                Base Version (Applied to DEV, TEST, PROD)
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => handleChange('version', e.target.value)}
                placeholder="e.g. V2025.4"
                className="w-full h-9 px-3 text-xs font-mono border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] bg-white"
              />
              <p className="text-[11px] text-[#64748B] mt-1">
                Each environment can still be updated with its own independent version later on the sheet.
              </p>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#CBD5E1] mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#475569] hover:text-[#1E293B] bg-white border border-[#CBD5E1] rounded hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#004B87] hover:bg-[#003B6D] rounded shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Create Customer Sheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
