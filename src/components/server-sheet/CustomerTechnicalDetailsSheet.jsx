import React, { useState, useRef, useEffect } from 'react';
import {
  ALLOWED_IMPLEMENTATION_TYPES,
  ALLOWED_SIZES,
  ALLOWED_STATUSES,
  ALLOWED_REGIONS,
} from '../../data/customerWorkbookData.js';

export const CustomerTechnicalDetailsSheet = ({
  customerSheet,
  customers = [],
  activeCustomerId,
  onSelectCustomer,
  onAddCustomerClick,
  onRequestDeleteCustomer,
  onUpdateMetadata,
  onUpdateEnvironmentValue,
  onUpdateEnvironmentVersion,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
  pendingChanges = {},
  canEdit = true,
  zoom = 100,
}) => {
  // Active selected cell state for Excel formula bar & cursor
  // Format: { rowKey: string, envKey: string | null, cellRef: string, value: string, isEditing: boolean }
  const [activeCell, setActiveCell] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const cellInputRef = useRef(null);

  // Focus input when editing starts
  useEffect(() => {
    if (activeCell?.isEditing && cellInputRef.current) {
      cellInputRef.current.focus();
      cellInputRef.current.select();
    }
  }, [activeCell?.isEditing]);

  if (!customerSheet) return null;

  const { metadata, environments, applications, name: customerName } = customerSheet;

  // Calculate current customer index and handlers for prev / next
  const currentIndex = customers && customers.length > 0
    ? customers.findIndex((c) => c.id === customerSheet.id)
    : -1;

  // Refs & scroll handlers for top scrollable customer names bar
  const topCustomerScrollRef = useRef(null);
  const activeCustomerItemRef = useRef(null);

  const scrollCustomerLeft = () => {
    if (topCustomerScrollRef.current) {
      topCustomerScrollRef.current.scrollBy({ left: -240, behavior: 'smooth' });
    }
  };

  const scrollCustomerRight = () => {
    if (topCustomerScrollRef.current) {
      topCustomerScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  // Keep active customer in view in top scrollable bar
  useEffect(() => {
    if (activeCustomerItemRef.current) {
      activeCustomerItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [customerSheet.id]);

  const handlePrevCustomer = () => {
    if (!customers || customers.length === 0 || !onSelectCustomer) return;
    const prevIndex = (currentIndex - 1 + customers.length) % customers.length;
    onSelectCustomer(customers[prevIndex].id);
  };

  const handleNextCustomer = () => {
    if (!customers || customers.length === 0 || !onSelectCustomer) return;
    const nextIndex = (currentIndex + 1) % customers.length;
    onSelectCustomer(customers[nextIndex].id);
  };

  // Handle cell click
  const handleCellClick = (rowKey, envKey, cellRef, currentValue, isEditable = true) => {
    if (activeCell?.rowKey === rowKey && activeCell?.envKey === envKey) {
      // Second click: enter edit mode if allowed
      if (canEdit && isEditable) {
        setActiveCell((prev) => ({ ...prev, isEditing: true }));
        setEditingValue(currentValue || '');
      }
    } else {
      setActiveCell({
        rowKey,
        envKey,
        cellRef,
        value: currentValue || '',
        isEditing: false,
        isEditable,
      });
      setEditingValue(currentValue || '');
    }
  };

  // Commit editing
  const commitEdit = (rowKey, envKey, value) => {
    if (envKey) {
      if (rowKey === 'version') {
        onUpdateEnvironmentVersion(customerSheet.id, envKey, value);
      } else {
        onUpdateEnvironmentValue(customerSheet.id, envKey, rowKey, value);
      }
    } else {
      // Metadata key
      onUpdateMetadata(customerSheet.id, rowKey, value);
    }
    setActiveCell((prev) => (prev ? { ...prev, value, isEditing: false } : null));
  };

  // Check if cell is dirty (has unsaved modifications)
  const isCellDirty = (keyPath) => {
    return Boolean(pendingChanges[keyPath]);
  };

  // Sections definitions
  const SERVER_DETAILS_FIELDS = [
    { key: 'citrixServer', label: 'Citrix Server' },
    { key: 'utilityServer', label: 'Utility Server' },
    { key: 'dbServerName', label: 'DB Server Name' },
    { key: 'vsCitrix', label: 'VS Citrix' },
    { key: 'reportingServer', label: 'Reporting Server' },
    { key: 'channelClusteringServer', label: 'Channel Clustering Server' },
    { key: 'daasServer', label: 'DAAS Server' },
  ];

  const DB_ACCOUNTS_FIELDS = [
    { key: 'databaseName', label: 'Database Name' },
    { key: 'dbKeyVaultName', label: 'DB Key Vault Name' },
    { key: 'storageAccountKeyVaultName', label: 'Storage Account Key Vault Name' },
  ];

  const GMSA_FIELDS = [
    { key: 'gmsaAccountName', label: 'Account Name' },
  ];

  const SFTP_FIELDS = [
    { key: 'sftpUserName', label: 'SFTP User Name' },
    { key: 'sftpGateway', label: 'SFTP Gateway' },
  ];

  const URL_FIELDS = [
    { key: 'realm', label: 'Realm' },
    { key: 'citrixUrl', label: 'Citrix URL' },
    { key: 'luminatePortalUrl', label: 'Luminate Portal URL' },
    { key: 'directOpenAccessUrl', label: 'Direct Open Access URL' },
    { key: 'contentServiceUrl', label: 'Content Service URL' },
    { key: 'imageServerUrl', label: 'Image Server URL' },
    { key: 'zabbixUrl', label: 'Zabbix URL' },
    { key: 'directSpacePlanningWebUrl', label: 'Direct Space Planning Web URL' },
    { key: 'directStrategicAssortmentUrl', label: 'Direct Strategic Assortment URL' },
    { key: 'directStrategicSpaceUrl', label: 'Direct Strategic Space URL' },
  ];

  const APP_CATEGORIES = [
    { key: 'citrixServer', label: 'Citrix Server' },
    { key: 'vsCitrix', label: 'VS Citrix' },
    { key: 'utilityServer', label: 'Utility Server' },
    { key: 'reportingServer', label: 'Reporting Server' },
    { key: 'dbServer', label: 'DB Server' },
    { key: 'thirdParty', label: 'Third Party' },
  ];

  // Helper to render editable cell
  const renderCell = ({
    rowKey,
    envKey,
    cellRef,
    currentValue,
    isSelect = false,
    options = [],
    isUrl = false,
    placeholder = 'NA',
  }) => {
    const isSelected = activeCell?.rowKey === rowKey && activeCell?.envKey === envKey;
    const isEditing = isSelected && activeCell?.isEditing && canEdit;
    const keyPath = envKey ? `${customerSheet.id}:${envKey}:${rowKey}` : `${customerSheet.id}:meta:${rowKey}`;
    const dirty = isCellDirty(keyPath);

    if (isEditing) {
      if (isSelect) {
        return (
          <select
            ref={cellInputRef}
            value={editingValue}
            onChange={(e) => {
              setEditingValue(e.target.value);
              commitEdit(rowKey, envKey, e.target.value);
            }}
            onBlur={() => commitEdit(rowKey, envKey, editingValue)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                commitEdit(rowKey, envKey, editingValue);
              }
            }}
            className="w-full h-full min-h-[26px] px-2 text-xs bg-white text-[#004B87] font-medium border-2 border-[#004B87] outline-none rounded-none shadow-xs"
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      }

      return (
        <input
          ref={cellInputRef}
          type="text"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onBlur={() => commitEdit(rowKey, envKey, editingValue)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitEdit(rowKey, envKey, editingValue);
            } else if (e.key === 'Escape') {
              setActiveCell((prev) => (prev ? { ...prev, isEditing: false } : null));
            }
          }}
          className="w-full h-full min-h-[26px] px-2 text-xs font-mono bg-white text-[#0F172A] border-2 border-[#004B87] outline-none rounded-none shadow-xs"
        />
      );
    }

    const displayVal = currentValue !== undefined && currentValue !== null && currentValue !== '' ? currentValue : placeholder;
    const isValNA = displayVal === 'NA';

    return (
      <div
        onClick={() => handleCellClick(rowKey, envKey, cellRef, currentValue)}
        onDoubleClick={() => {
          if (canEdit) {
            setActiveCell({
              rowKey,
              envKey,
              cellRef,
              value: currentValue || '',
              isEditing: true,
              isEditable: true,
            });
            setEditingValue(currentValue || '');
          }
        }}
        className={`relative w-full h-full min-h-[28px] px-2.5 py-1 text-xs flex items-center transition-colors cursor-cell ${
          isSelected
            ? 'bg-[#E0F2FE]/50 ring-2 ring-[#004B87] ring-inset z-10'
            : 'hover:bg-[#F8FAFC]'
        } ${dirty ? 'bg-amber-50/70' : ''}`}
      >
        {/* Unsaved Modification Indicator (Amber Dog-Ear) */}
        {dirty && (
          <span
            className="absolute top-0 right-0 w-0 h-0 border-t-[7px] border-l-[7px] border-t-amber-500 border-l-transparent"
            title="Modified cell (unsaved)"
          />
        )}

        {/* Value Display */}
        {isUrl && displayVal && !isValNA && displayVal.startsWith('http') ? (
          <div className="flex items-center justify-between w-full gap-1 min-w-0">
            <span className="font-mono text-[#004B87] hover:underline truncate" title={displayVal}>
              {displayVal}
            </span>
            <a
              href={displayVal}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[#64748B] hover:text-[#004B87] p-0.5 rounded shrink-0"
              title="Open link in new tab"
            >
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </a>
          </div>
        ) : (
          <span
            className={`truncate ${
              isValNA
                ? 'text-[#94A3B8] italic'
                : 'font-mono text-[#1E293B]'
            }`}
            title={String(displayVal)}
          >
            {displayVal}
          </span>
        )}
      </div>
    );
  };

  // Row counter for Excel row numbers (starts at 2 since row 1 is Customer Name in table header)
  let excelRowNumber = 2;

  return (
    <div
      className="flex-1 flex flex-col bg-white overflow-hidden"
      style={{ zoom: `${zoom}%` }}
    >
      {/* ========================================================= */}
      {/* SCROLLABLE CUSTOMER NAMES BAR (BRIGHT, CLEAR, AT TOP)     */}
      {/* ========================================================= */}
      <div className="bg-[#F8FAFC] border-b border-[#CBD5E1] select-none shrink-0 shadow-xs z-20">
        {/* Row 1: Bright, Crisp Horizontally Scrollable Customer Names Strip */}
        <div className="flex items-center px-3 py-2 border-b border-[#E2E8F0] gap-2">
          {/* Label with icon & count */}
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-[#CBD5E1]">
            <span className="material-symbols-outlined text-[18px] text-[#004B87]">domain</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
              Customers
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#004B87] font-bold">
              {customers.length}
            </span>
          </div>

          {/* Left scroll button */}
          <button
            type="button"
            onClick={scrollCustomerLeft}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer shrink-0 border border-[#CBD5E1] shadow-2xs"
            title="Scroll customer names left"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          {/* Horizontally Scrollable Customer Names List */}
          <div
            ref={topCustomerScrollRef}
            className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-1 py-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {customers.map((c) => {
              const isActive = c.id === customerSheet.id;
              return (
                <button
                  key={c.id}
                  ref={isActive ? activeCustomerItemRef : null}
                  type="button"
                  onClick={() => onSelectCustomer && onSelectCustomer(c.id)}
                  className={`group flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#004B87] to-[#00B7F1] text-white font-bold shadow-md ring-2 ring-[#00B7F1]/60 border-transparent'
                      : 'bg-gradient-to-r from-[#003B6D] to-[#005B9E] hover:from-[#004B87] hover:to-[#00B7F1] text-white font-medium border border-[#004B87]/50 shadow-xs hover:shadow-sm opacity-90 hover:opacity-100'
                  }`}
                  title={`${c.name} - Click to view technical details sheet`}
                >
                  <span
                    className={`rounded-full shrink-0 ${
                      isActive ? 'w-2 h-2 bg-white shadow-xs' : 'w-1.5 h-1.5 bg-white/70 group-hover:bg-white'
                    }`}
                  />
                  <span className="tracking-tight text-white">{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right scroll button */}
          <button
            type="button"
            onClick={scrollCustomerRight}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white hover:bg-[#F1F5F9] text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer shrink-0 border border-[#CBD5E1] shadow-2xs"
            title="Scroll customer names right"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Row 2: Clean Customer Name Title (NO region, NO jpower id, NO other metadata clutter) */}
        <div className="px-4 py-2.5 bg-white border-b border-[#CBD5E1] flex items-center justify-between gap-3">
          {/* Customer Name only */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] border border-[#BAE6FD] text-[#004B87] flex items-center justify-center font-bold shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-[20px]">domain</span>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
                Customer Sheet
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight leading-tight">
                {customerName}
              </h2>
            </div>
          </div>

          {/* Dustbin Delete Button for the active customer sheet */}
          {onRequestDeleteCustomer && (
            <button
              type="button"
              onClick={() => onRequestDeleteCustomer(customerSheet)}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title={`Delete sheet for ${customerName}`}
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Delete Sheet</span>
            </button>
          )}
        </div>
      </div>

      {/* Excel Formula Bar / Active Cell Name Box */}
      <div className="flex items-center px-3 py-1.5 bg-[#F8FAFC] border-b border-[#CBD5E1] text-xs gap-2 select-none shrink-0 shadow-2xs">
        {/* Name Box (e.g. B14) */}
        <div className="flex items-center bg-white border border-[#CBD5E1] rounded px-2.5 py-0.5 min-w-[70px] justify-center font-mono font-semibold text-[#004B87] shadow-inner">
          {activeCell?.cellRef || 'A1'}
        </div>

        {/* Formula symbol */}
        <span className="text-[#94A3B8] font-serif italic text-sm font-bold px-1">
          fx
        </span>

        {/* Formula Input Box */}
        <input
          type="text"
          value={activeCell ? (activeCell.isEditing ? editingValue : activeCell.value) : ''}
          onChange={(e) => {
            if (!canEdit) return;
            setEditingValue(e.target.value);
            if (activeCell) {
              setActiveCell((prev) => ({ ...prev, isEditing: true }));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && activeCell && canEdit) {
              commitEdit(activeCell.rowKey, activeCell.envKey, editingValue);
            }
          }}
          disabled={!canEdit || !activeCell}
          placeholder={activeCell ? 'Formula or cell content' : 'Select a cell to view or edit its value'}
          className="flex-1 h-7 px-2.5 bg-white border border-[#CBD5E1] rounded font-mono text-xs text-[#0F172A] focus:outline-none focus:border-[#004B87] focus:ring-1 focus:ring-[#004B87] transition-all disabled:bg-[#F1F5F9] disabled:text-[#94A3B8]"
        />
      </div>

      {/* Spreadsheet Main Grid Area */}
      <div className="flex-1 overflow-auto bg-[#F8FAFC]">
        <div className="inline-block min-w-full align-middle bg-white shadow-sm border border-[#CBD5E1]">
          <table className="w-full border-collapse text-left select-text">
            {/* Table Header: Customer Name Header & Column Letters */}
            <thead>
              {/* Sticky Customer Name Header Row at Top of Information Table */}
              <tr className="bg-[#004B87] text-white border-b border-[#003B6D] select-none sticky top-0 z-30">
                <th className="w-12 text-center py-2 border-r border-[#003B6D] bg-[#003B6D] font-mono text-[10px] text-white/80">
                  1
                </th>
                <th
                  colSpan={4}
                  className="py-2.5 px-4 text-center font-bold text-sm tracking-wide text-white uppercase shadow-inner"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#00B7F1]">
                      domain
                    </span>
                    <span>{customerName} - Technical Details</span>
                  </div>
                </th>
              </tr>

              {/* Column Letters (A, B, C, D) */}
              <tr className="bg-[#F1F5F9] text-[#64748B] text-[11px] font-semibold border-b border-[#CBD5E1] select-none sticky top-[41px] z-20">
                {/* Top-left corner row header */}
                <th className="w-12 text-center py-1 border-r border-[#CBD5E1] bg-[#E2E8F0] font-mono text-[#64748B]">
                  
                </th>
                {/* Column A: Specification Field */}
                <th className="w-[320px] px-3 py-1 border-r border-[#CBD5E1] text-center font-mono tracking-wider">
                  A
                </th>
                {/* Column B: DEV */}
                <th className="w-[280px] px-3 py-1 border-r border-[#CBD5E1] text-center font-mono tracking-wider">
                  B
                </th>
                {/* Column C: TEST */}
                <th className="w-[280px] px-3 py-1 border-r border-[#CBD5E1] text-center font-mono tracking-wider">
                  C
                </th>
                {/* Column D: PROD */}
                <th className="w-[280px] px-3 py-1 border-r border-[#CBD5E1] text-center font-mono tracking-wider">
                  D
                </th>
              </tr>
            </thead>

            <tbody>
              {/* ========================================================= */}
              {/* METADATA SECTION HEADER                                    */}
              {/* ========================================================= */}
              <tr className="border-b border-[#CBD5E1] bg-[#E0F2FE]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td
                  colSpan={4}
                  className="py-1.5 px-3 text-xs font-bold text-[#004B87] uppercase tracking-wider bg-gradient-to-r from-[#E0F2FE] via-[#BAE6FD]/40 to-transparent"
                >
                  CUSTOMER SPECIFICATION METADATA
                </td>
              </tr>

              {/* METADATA ROWS */}
              {/* Primary Onboarding SME */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  Onboarding SME Name - Primary
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'primarySme',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.primarySme,
                    placeholder: 'Enter Primary SME Name',
                  })}
                </td>
              </tr>

              {/* Secondary Onboarding SME */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  Onboarding SME Name - Secondary
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'secondarySme',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.secondarySme,
                    placeholder: 'Enter Secondary SME Name',
                  })}
                </td>
              </tr>

              {/* Implementation Type */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  Implementation
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'implementationType',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.implementationType,
                    isSelect: true,
                    options: ALLOWED_IMPLEMENTATION_TYPES,
                  })}
                </td>
              </tr>

              {/* T-Shirt / Size */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  T-Shirt / Size
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'size',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.size,
                    isSelect: true,
                    options: ALLOWED_SIZES,
                  })}
                </td>
              </tr>

              {/* JPower ID */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  JPower ID
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'jpowerId',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.jpowerId,
                    placeholder: 'Enter JPower ID',
                  })}
                </td>
              </tr>

              {/* MSC / DSS */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  MSC / DSS
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'mscDss',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.mscDss,
                    placeholder: 'Enter MSC / DSS',
                  })}
                </td>
              </tr>

              {/* Customer Code */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  Customer Code
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'customerCode',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.customerCode,
                    placeholder: 'Enter Customer Code',
                  })}
                </td>
              </tr>

              {/* Cloud Region */}
              <tr className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  Cloud Region
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'cloudRegion',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.cloudRegion,
                    isSelect: true,
                    options: ALLOWED_REGIONS,
                  })}
                </td>
              </tr>

              {/* Status */}
              <tr className="border-b border-[#CBD5E1] hover:bg-[#F8FAFC]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#E2E8F0] bg-[#F8FAFC]">
                  Status
                </td>
                <td colSpan={3} className="p-0 border-r border-[#E2E8F0]">
                  {renderCell({
                    rowKey: 'status',
                    envKey: null,
                    cellRef: `B${excelRowNumber - 1}`,
                    currentValue: metadata.status,
                    isSelect: true,
                    options: ALLOWED_STATUSES,
                  })}
                </td>
              </tr>

              {/* ========================================================= */}
              {/* ENVIRONMENT COLUMNS HEADER                                 */}
              {/* ========================================================= */}
              <tr className="border-b border-[#004B87] bg-[#004B87] text-white">
                <td className="text-center py-1.5 border-r border-[#003B6D] bg-[#003B6D] font-mono text-[10px] text-white/80 select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-r border-[#003B6D]">
                  Environment
                </td>
                <td className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider border-r border-[#003B6D] bg-[#004B87]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    DEV
                  </span>
                </td>
                <td className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider border-r border-[#003B6D] bg-[#004B87]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    TEST
                  </span>
                </td>
                <td className="px-3 py-1.5 text-center text-xs font-bold uppercase tracking-wider border-r border-[#003B6D] bg-[#004B87]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    PROD
                  </span>
                </td>
              </tr>

              {/* VERSION ROW (Independent per environment!) */}
              <tr className="border-b border-[#CBD5E1] bg-[#EFF6FF] font-semibold">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                  {excelRowNumber++}
                </td>
                <td className="px-3 py-1 text-xs font-bold text-[#004B87] border-r border-[#CBD5E1]">
                  Version
                </td>
                {['DEV', 'TEST', 'PROD'].map((envKey, colIdx) => {
                  const colLetter = ['B', 'C', 'D'][colIdx];
                  const currentVer = environments[envKey]?.version || 'V2025.4';
                  return (
                    <td key={envKey} className="p-0 border-r border-[#CBD5E1]">
                      {renderCell({
                        rowKey: 'version',
                        envKey,
                        cellRef: `${colLetter}${excelRowNumber - 1}`,
                        currentValue: currentVer,
                        placeholder: 'V2025.4',
                      })}
                    </td>
                  );
                })}
              </tr>

              {/* ========================================================= */}
              {/* GROUP 1: SERVER DETAILS                                   */}
              {/* ========================================================= */}
              <tr className="border-b border-[#CBD5E1] bg-[#E2E8F0]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#CBD5E1] font-mono text-[10px] text-[#64748B] select-none">
                  {excelRowNumber++}
                </td>
                <td
                  colSpan={4}
                  className="py-1.5 px-3 text-xs font-bold text-[#004B87] uppercase tracking-wider bg-[#E2E8F0]"
                >
                  SERVER DETAILS
                </td>
              </tr>
              {SERVER_DETAILS_FIELDS.map((field) => {
                const currentNum = excelRowNumber++;
                return (
                  <tr key={field.key} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                      {currentNum}
                    </td>
                    <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#CBD5E1] bg-[#FAFAFA]">
                      {field.label}
                    </td>
                    {['DEV', 'TEST', 'PROD'].map((envKey, colIdx) => {
                      const colLetter = ['B', 'C', 'D'][colIdx];
                      return (
                        <td key={envKey} className="p-0 border-r border-[#CBD5E1]">
                          {renderCell({
                            rowKey: field.key,
                            envKey,
                            cellRef: `${colLetter}${currentNum}`,
                            currentValue: environments[envKey]?.[field.key],
                            placeholder: 'NA',
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ========================================================= */}
              {/* GROUP 2: DATABASE ACCOUNTS                                */}
              {/* ========================================================= */}
              <tr className="border-b border-[#CBD5E1] bg-[#E2E8F0]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#CBD5E1] font-mono text-[10px] text-[#64748B] select-none">
                  {excelRowNumber++}
                </td>
                <td
                  colSpan={4}
                  className="py-1.5 px-3 text-xs font-bold text-[#004B87] uppercase tracking-wider bg-[#E2E8F0]"
                >
                  DATABASE ACCOUNTS
                </td>
              </tr>
              {DB_ACCOUNTS_FIELDS.map((field) => {
                const currentNum = excelRowNumber++;
                return (
                  <tr key={field.key} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                      {currentNum}
                    </td>
                    <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#CBD5E1] bg-[#FAFAFA]">
                      {field.label}
                    </td>
                    {['DEV', 'TEST', 'PROD'].map((envKey, colIdx) => {
                      const colLetter = ['B', 'C', 'D'][colIdx];
                      return (
                        <td key={envKey} className="p-0 border-r border-[#CBD5E1]">
                          {renderCell({
                            rowKey: field.key,
                            envKey,
                            cellRef: `${colLetter}${currentNum}`,
                            currentValue: environments[envKey]?.[field.key],
                            placeholder: 'NA',
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ========================================================= */}
              {/* GROUP 3: GMSA ACCOUNTS                                    */}
              {/* ========================================================= */}
              <tr className="border-b border-[#CBD5E1] bg-[#E2E8F0]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#CBD5E1] font-mono text-[10px] text-[#64748B] select-none">
                  {excelRowNumber++}
                </td>
                <td
                  colSpan={4}
                  className="py-1.5 px-3 text-xs font-bold text-[#004B87] uppercase tracking-wider bg-[#E2E8F0]"
                >
                  GMSA ACCOUNTS
                </td>
              </tr>
              {GMSA_FIELDS.map((field) => {
                const currentNum = excelRowNumber++;
                return (
                  <tr key={field.key} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                      {currentNum}
                    </td>
                    <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#CBD5E1] bg-[#FAFAFA]">
                      {field.label}
                    </td>
                    {['DEV', 'TEST', 'PROD'].map((envKey, colIdx) => {
                      const colLetter = ['B', 'C', 'D'][colIdx];
                      return (
                        <td key={envKey} className="p-0 border-r border-[#CBD5E1]">
                          {renderCell({
                            rowKey: field.key,
                            envKey,
                            cellRef: `${colLetter}${currentNum}`,
                            currentValue: environments[envKey]?.[field.key],
                            placeholder: 'NA',
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ========================================================= */}
              {/* GROUP 4: SFTP                                             */}
              {/* ========================================================= */}
              <tr className="border-b border-[#CBD5E1] bg-[#E2E8F0]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#CBD5E1] font-mono text-[10px] text-[#64748B] select-none">
                  {excelRowNumber++}
                </td>
                <td
                  colSpan={4}
                  className="py-1.5 px-3 text-xs font-bold text-[#004B87] uppercase tracking-wider bg-[#E2E8F0]"
                >
                  SFTP
                </td>
              </tr>
              {SFTP_FIELDS.map((field) => {
                const currentNum = excelRowNumber++;
                return (
                  <tr key={field.key} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                      {currentNum}
                    </td>
                    <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#CBD5E1] bg-[#FAFAFA]">
                      {field.label}
                    </td>
                    {['DEV', 'TEST', 'PROD'].map((envKey, colIdx) => {
                      const colLetter = ['B', 'C', 'D'][colIdx];
                      return (
                        <td key={envKey} className="p-0 border-r border-[#CBD5E1]">
                          {renderCell({
                            rowKey: field.key,
                            envKey,
                            cellRef: `${colLetter}${currentNum}`,
                            currentValue: environments[envKey]?.[field.key],
                            placeholder: 'NA',
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ========================================================= */}
              {/* GROUP 5: URLS                                             */}
              {/* ========================================================= */}
              <tr className="border-b border-[#CBD5E1] bg-[#E2E8F0]">
                <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#CBD5E1] font-mono text-[10px] text-[#64748B] select-none">
                  {excelRowNumber++}
                </td>
                <td
                  colSpan={4}
                  className="py-1.5 px-3 text-xs font-bold text-[#004B87] uppercase tracking-wider bg-[#E2E8F0]"
                >
                  URLS
                </td>
              </tr>
              {URL_FIELDS.map((field) => {
                const currentNum = excelRowNumber++;
                return (
                  <tr key={field.key} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                    <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                      {currentNum}
                    </td>
                    <td className="px-3 py-1 text-xs font-medium text-[#334155] border-r border-[#CBD5E1] bg-[#FAFAFA]">
                      {field.label}
                    </td>
                    {['DEV', 'TEST', 'PROD'].map((envKey, colIdx) => {
                      const colLetter = ['B', 'C', 'D'][colIdx];
                      return (
                        <td key={envKey} className="p-0 border-r border-[#CBD5E1]">
                          {renderCell({
                            rowKey: field.key,
                            envKey,
                            cellRef: `${colLetter}${currentNum}`,
                            currentValue: environments[envKey]?.[field.key],
                            isUrl: true,
                            placeholder: 'NA',
                          })}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* ========================================================= */}
              {/* GROUP 6: APPLICATIONS INSTALLED ON SERVERS                */}
              {/* ========================================================= */}
              <tr className="border-b border-[#CBD5E1] bg-[#004B87] text-white">
                <td className="text-center py-1.5 border-r border-[#003B6D] bg-[#003B6D] font-mono text-[10px] text-white/80 select-none">
                  {excelRowNumber++}
                </td>
                <td
                  colSpan={4}
                  className="py-1.5 px-3 text-xs font-bold uppercase tracking-wider"
                >
                  APPLICATIONS INSTALLED ON SERVERS
                </td>
              </tr>

              {/* Application Subsections */}
              {APP_CATEGORIES.map((cat) => {
                const appList = applications?.[cat.key] || [];
                const headerRowNum = excelRowNumber++;

                return (
                  <React.Fragment key={cat.key}>
                    {/* Subsection Header */}
                    <tr className="border-b border-[#CBD5E1] bg-[#F0F9FF]">
                      <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#E0F2FE] font-mono text-[10px] text-[#004B87] select-none font-bold">
                        {headerRowNum}
                      </td>
                      <td
                        colSpan={4}
                        className="py-1.5 px-3 text-xs font-bold text-[#0284C7] uppercase tracking-wide bg-[#F0F9FF]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]"></span>
                            {cat.label}
                          </span>
                          {canEdit && (
                            <button
                              onClick={() => onAddApplication(customerSheet.id, cat.key)}
                              className="text-[11px] font-semibold text-[#004B87] hover:text-[#003B6D] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-[#BAE6FD]"
                              title={`Add new application under ${cat.label}`}
                            >
                              <span className="material-symbols-outlined text-[14px]">add</span>
                              <span>+ Add App Row</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Applications Rows */}
                    {appList.length === 0 ? (
                      <tr className="border-b border-[#E2E8F0]">
                        <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                          {excelRowNumber++}
                        </td>
                        <td className="px-4 py-1 text-xs text-[#94A3B8] italic border-r border-[#CBD5E1]">
                          NA (No applications configured)
                        </td>
                        <td className="px-3 py-1 text-xs font-mono text-[#94A3B8] italic border-r border-[#CBD5E1]">
                          NA
                        </td>
                        <td className="px-3 py-1 text-xs font-mono text-[#94A3B8] italic border-r border-[#CBD5E1]">
                          NA
                        </td>
                        <td className="px-3 py-1 text-xs font-mono text-[#94A3B8] italic border-r border-[#CBD5E1]">
                          NA
                        </td>
                      </tr>
                    ) : (
                      appList.map((appName, index) => {
                        const rowNum = excelRowNumber++;
                        return (
                          <tr key={`${cat.key}-${index}`} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC] group">
                            <td className="text-center py-1 border-r border-[#CBD5E1] bg-[#F1F5F9] font-mono text-[10px] text-[#94A3B8] select-none">
                              {rowNum}
                            </td>
                            {/* Column A: App Name (editable) */}
                            <td className="px-3 py-1 text-xs font-medium text-[#1E293B] border-r border-[#CBD5E1] bg-[#FAFAFA]">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-xs">{appName}</span>
                                {canEdit && (
                                  <button
                                    onClick={() => onDeleteApplication(customerSheet.id, cat.key, index)}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded transition-opacity cursor-pointer"
                                    title="Delete application row"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            {/* Columns B, C, D: DEV, TEST, PROD status */}
                            <td className="px-3 py-1 text-xs font-mono text-emerald-700 border-r border-[#CBD5E1] bg-emerald-50/20">
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                                Installed
                              </span>
                            </td>
                            <td className="px-3 py-1 text-xs font-mono text-emerald-700 border-r border-[#CBD5E1] bg-emerald-50/20">
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                                Installed
                              </span>
                            </td>
                            <td className="px-3 py-1 text-xs font-mono text-emerald-700 border-r border-[#CBD5E1] bg-emerald-50/20">
                              <span className="inline-flex items-center gap-1 text-[11px]">
                                <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                                Installed
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
