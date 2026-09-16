import React from 'react';

export const WorkbookToolbar = ({
  customers,
  activeCustomerId,
  onSelectCustomer,
  searchQuery,
  onSearchChange,
  pendingChangesCount = 0,
  onSaveChanges,
  onDiscardChanges,
  onAddCustomerClick,
  onExportWorkbook,
  canEdit = true,
  canAddCustomer = true,
  zoom = 100,
  onZoomChange,
}) => {
  const activeCustomer = customers.find((c) => c.id === activeCustomerId) || customers[0];

  return (
    <div className="bg-white border-b border-[#CBD5E1] px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none shrink-0 shadow-xs">
      {/* Left: Workbook Title & Customer Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#004B87] text-white flex items-center justify-center font-bold text-base shadow-xs">
            <span className="material-symbols-outlined text-[20px]">table_chart</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">
                SERVER DETAILS WORKBOOK
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E0F2FE] text-[#004B87] border border-[#BAE6FD]">
                Enterprise Sheet
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Customer Technical Details & Multi-Environment Configuration
            </p>
          </div>
        </div>

        <div className="h-6 w-px bg-[#CBD5E1] hidden sm:block mx-1" />

        {/* Fast Customer Search Box */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-2 text-[#94A3B8] text-[16px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Customer / Code / JPower..."
            className="h-8 w-48 sm:w-64 pl-8 pr-7 text-xs bg-[#F8FAFC] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] transition-all text-[#1E293B]"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & Save / Cancel */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Add Customer Button */}
        {canAddCustomer && (
          <button
            onClick={onAddCustomerClick}
            className="flex items-center gap-1 h-8 px-3 text-xs font-bold text-[#004B87] bg-white hover:bg-[#E0F2FE] border border-[#004B87] rounded transition-colors cursor-pointer shadow-2xs"
            title="Add a new customer worksheet using the standard template"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Add Customer</span>
          </button>
        )}

        {/* Export Workbook */}
        <button
          onClick={onExportWorkbook}
          className="flex items-center gap-1 h-8 px-3 text-xs font-semibold text-[#334155] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] rounded transition-colors cursor-pointer"
          title="Export current technical details sheet to CSV"
        >
          <span className="material-symbols-outlined text-[16px] text-emerald-600">
            download
          </span>
          <span className="hidden sm:inline">Export Sheet</span>
        </button>

        {/* Compact Zoom Controls */}
        {onZoomChange && (
          <div className="hidden lg:flex items-center bg-[#F8FAFC] border border-[#CBD5E1] rounded h-8 px-1">
            <button
              onClick={() => onZoomChange(Math.max(70, zoom - 10))}
              className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded cursor-pointer transition-colors"
              title="Zoom out"
            >
              <span className="material-symbols-outlined text-[14px]">remove</span>
            </button>
            <span className="text-[11px] font-mono font-medium text-[#475569] px-1.5 w-10 text-center select-none">
              {zoom}%
            </span>
            <button
              onClick={() => onZoomChange(Math.min(150, zoom + 10))}
              className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded cursor-pointer transition-colors"
              title="Zoom in"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
            </button>
          </div>
        )}

        {/* Pending Changes Save & Discard Buttons */}
        {pendingChangesCount > 0 && canEdit && (
          <div className="flex items-center gap-1.5 pl-1 border-l border-[#CBD5E1]">
            <button
              onClick={onDiscardChanges}
              className="h-8 px-2.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded border border-[#CBD5E1] transition-colors cursor-pointer"
              title="Discard all pending modifications"
            >
              Cancel
            </button>
            <button
              onClick={onSaveChanges}
              className="flex items-center gap-1.5 h-8 px-3.5 text-xs font-bold text-white bg-gradient-to-r from-[#004B87] to-[#0072CE] hover:from-[#003B6D] hover:to-[#005FA3] rounded shadow-xs transition-all cursor-pointer animate-pulse"
              title="Commit and save all modified cells"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Changes ({pendingChangesCount})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
