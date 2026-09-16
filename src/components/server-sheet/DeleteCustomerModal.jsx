import React from 'react';

export const DeleteCustomerModal = ({
  isOpen,
  customer,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl border border-[#CBD5E1] w-full max-w-md overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-sheet-title"
      >
        {/* Modal Header */}
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">delete_forever</span>
          </div>
          <div>
            <h2 id="delete-sheet-title" className="text-base font-bold text-red-900">
              Delete Customer Sheet
            </h2>
            <p className="text-xs text-red-700">
              This action cannot be undone
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 text-sm text-[#334155] space-y-3">
          <p>
            Are you sure you want to delete the technical sheet for{' '}
            <span className="font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {customer.name}
            </span>
            ?
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">
              warning
            </span>
            <span>
              All server details, database configurations, and application mappings across <strong>DEV</strong>, <strong>TEST</strong>, and <strong>PROD</strong> for this customer will be permanently removed.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 border-t border-[#E2E8F0] px-6 py-3.5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#475569] hover:text-[#0F172A] bg-white border border-[#CBD5E1] hover:bg-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmDelete(customer.id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            <span>Delete Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
