import React, { useRef, useState } from 'react';

export const WorkbookTabs = ({
  customers,
  activeCustomerId,
  onSelectCustomer,
  onAddCustomerClick,
  searchQuery,
  onSearchChange,
  pendingChangesCount = 0,
  zoom = 100,
  onZoomChange,
  canAddCustomer = true,
}) => {
  const tabsContainerRef = useRef(null);

  const handleScrollLeft = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  const handleScrollFirst = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const handleScrollLast = () => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollTo({
        left: tabsContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
    }
  };

  // Filter customer tabs based on search
  const filteredCustomers = customers.filter((cust) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = cust.name.toLowerCase().includes(query);
    const codeMatch = cust.metadata?.customerCode?.toLowerCase().includes(query);
    const jpowerMatch = cust.metadata?.jpowerId?.toLowerCase().includes(query);
    return nameMatch || codeMatch || jpowerMatch;
  });

  const activeCustomerIndex = customers.findIndex((c) => c.id === activeCustomerId);

  return (
    <div className="sticky bottom-0 z-30 bg-[#F1F5F9] border-t border-[#CBD5E1] shadow-[0_-2px_10px_rgba(0,0,0,0.05)] select-none">
      {/* Upper Sheet Tabs Bar */}
      <div className="flex items-center justify-between px-2 pt-1 pb-0 gap-2 overflow-hidden">
        {/* Left: Tab Scroll Controls & Tab Strip */}
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {/* Excel-style Tab Scroll Buttons */}
          <div className="flex items-center bg-white border border-[#CBD5E1] rounded shadow-xs overflow-hidden shrink-0">
            <button
              onClick={handleScrollFirst}
              className="w-6 h-7 flex items-center justify-center text-[#64748B] hover:text-[#004B87] hover:bg-[#E2E8F0] transition-colors border-r border-[#CBD5E1] cursor-pointer"
              title="First Sheet"
            >
              <span className="material-symbols-outlined text-[15px]">first_page</span>
            </button>
            <button
              onClick={handleScrollLeft}
              className="w-6 h-7 flex items-center justify-center text-[#64748B] hover:text-[#004B87] hover:bg-[#E2E8F0] transition-colors border-r border-[#CBD5E1] cursor-pointer"
              title="Previous Sheet"
            >
              <span className="material-symbols-outlined text-[15px]">chevron_left</span>
            </button>
            <button
              onClick={handleScrollRight}
              className="w-6 h-7 flex items-center justify-center text-[#64748B] hover:text-[#004B87] hover:bg-[#E2E8F0] transition-colors border-r border-[#CBD5E1] cursor-pointer"
              title="Next Sheet"
            >
              <span className="material-symbols-outlined text-[15px]">chevron_right</span>
            </button>
            <button
              onClick={handleScrollLast}
              className="w-6 h-7 flex items-center justify-center text-[#64748B] hover:text-[#004B87] hover:bg-[#E2E8F0] transition-colors cursor-pointer"
              title="Last Sheet"
            >
              <span className="material-symbols-outlined text-[15px]">last_page</span>
            </button>
          </div>

          {/* Scrollable Worksheet Tabs Strip */}
          <div
            ref={tabsContainerRef}
            className="flex items-end gap-0.5 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredCustomers.map((cust) => {
              const isActive = cust.id === activeCustomerId;
              const isTemplate = cust.isTemplate;

              return (
                <button
                  key={cust.id}
                  onClick={() => onSelectCustomer(cust.id)}
                  className={`group relative flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-t-md transition-all cursor-pointer shrink-0 border-t border-x ${
                    isActive
                      ? 'bg-white text-[#004B87] font-semibold border-[#CBD5E1] shadow-[0_-2px_4px_rgba(0,0,0,0.03)] z-10 -mb-[1px] pb-2'
                      : 'bg-[#E2E8F0]/80 hover:bg-[#E2E8F0] text-[#475569] hover:text-[#1E293B] border-transparent hover:border-[#CBD5E1]'
                  }`}
                  title={`${cust.name} (${cust.metadata?.customerCode || 'N/A'})`}
                >
                  {/* Active Green/Blue Top Indicator */}
                  {isActive && (
                    <span className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#004B87] rounded-t-sm" />
                  )}

                  {/* Tab Icon */}
                  <span
                    className={`material-symbols-outlined text-[15px] ${
                      isTemplate ? 'text-amber-500' : isActive ? 'text-[#004B87]' : 'text-[#64748B]'
                    }`}
                  >
                    {isTemplate ? 'tune' : 'table_view'}
                  </span>

                  {/* Customer Tab Label */}
                  <span className="whitespace-nowrap tracking-tight">
                    {cust.name}
                  </span>

                  {/* Customer Code Pill */}
                  {cust.metadata?.customerCode && !isTemplate && (
                    <span
                      className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                        isActive
                          ? 'bg-[#E0F2FE] text-[#004B87] font-medium'
                          : 'bg-[#CBD5E1]/60 text-[#64748B]'
                      }`}
                    >
                      {cust.metadata.customerCode}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Obvious [ + Add Customer ] Action Button */}
            {canAddCustomer && (
              <button
                onClick={onAddCustomerClick}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#004B87] bg-white/90 hover:bg-[#E0F2FE] border border-dashed border-[#004B87]/40 hover:border-[#004B87] rounded-t-md transition-colors cursor-pointer shrink-0 ml-1 shadow-2xs group"
                title="Create a new customer worksheet using the standard template"
              >
                <span className="material-symbols-outlined text-[16px] text-[#004B87] group-hover:rotate-90 transition-transform duration-200">
                  add
                </span>
                <span className="whitespace-nowrap font-bold">+ Add Customer</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Tab Search & Jump */}
        <div className="flex items-center gap-2 shrink-0 py-0.5">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-[#94A3B8] text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filter customer tabs..."
              className="h-7 w-36 sm:w-44 pl-7 pr-6 text-xs bg-white border border-[#CBD5E1] rounded focus:w-56 focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] transition-all text-[#1E293B]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-1.5 text-[#94A3B8] hover:text-[#475569] cursor-pointer"
                title="Clear filter"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Excel Status Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#E2E8F0] border-t border-[#CBD5E1] text-[11px] text-[#475569]">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-[#004B87]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            READY
          </span>

          <span className="text-[#94A3B8]">|</span>

          <span>
            Customer Sheet{' '}
            <strong className="text-[#1E293B]">
              {activeCustomerIndex >= 0 ? activeCustomerIndex + 1 : 1}
            </strong>{' '}
            of <strong className="text-[#1E293B]">{customers.length}</strong>
          </span>

          {pendingChangesCount > 0 && (
            <>
              <span className="text-[#94A3B8]">|</span>
              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300">
                <span className="material-symbols-outlined text-[13px]">edit</span>
                {pendingChangesCount} unsaved modification{pendingChangesCount > 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>

        {/* View Controls & Zoom Slider */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-[#64748B]">Zoom:</span>
          <div className="flex items-center bg-white border border-[#CBD5E1] rounded px-1 py-0.5">
            {[80, 90, 100, 110].map((level) => (
              <button
                key={level}
                onClick={() => onZoomChange && onZoomChange(level)}
                className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                  zoom === level
                    ? 'bg-[#004B87] text-white'
                    : 'text-[#64748B] hover:text-[#004B87] hover:bg-[#F1F5F9]'
                }`}
              >
                {level}%
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
