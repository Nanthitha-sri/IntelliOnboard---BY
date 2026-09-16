import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  loadOnboardingProjects,
  saveOnboardingProjects,
} from '../data/customerStore.js';

// Helper to normalize external projects (e.g. from Start New OB) into the 18 columns
const normalizeProject = (p, index) => {
  const tShirtMap = (val) => {
    if (!val) return 'Medium';
    const s = String(val).toUpperCase();
    if (s.includes('VERY LARGE') || s.startsWith('XL')) return 'Very Large';
    if (s.includes('LARGE') || s.startsWith('L')) return 'Large';
    if (s.includes('VERY SMALL') || s.startsWith('VS')) return 'Very Small';
    if (s.includes('SMALL') || s.startsWith('S')) return 'Small';
    return 'Medium';
  };

  const typeMap = (val) => {
    if (!val) return 'New Implementation';
    const s = String(val).toLowerCase();
    if (s.includes('upgrade')) return 'Upgrade';
    if (s.includes('j2c')) return 'J2C';
    return 'New Implementation';
  };

  return {
    id: p.id || `ext-${index}-${Date.now()}`,
    customer: p.customerName || p.customer || 'Customer 1',
    solution: p.solution || 'Category Management',
    type: typeMap(p.type),
    status: p.status || (p.stage?.includes('Completed') ? 'Completed' : 'In Progress'),
    transitioned: p.transitioned || (p.stage?.includes('Completed') ? 'Yes' : 'No'),
    implementationTeam: p.implementationTeam || 'Cloud Delivery Pod Alpha',
    version: p.version || '2026.1.0',
    projectL3: p.projectL3 || p.leadSme?.name || 'Alex Vance',
    location: p.location || 'Dallas, TX',
    secondarySme: p.secondarySme || (p.assignedEngineers?.[1]?.name || 'Elena Rostova'),
    tShirtSize: tShirtMap(p.tShirtSize || p.tshirtSize),
    noOfSubscriptions: Number(p.noOfSubscriptions) || Math.max(8, Math.floor((p.planograms || 5000) / 200)),
    platform: p.platform || 'Azure Cloud',
    startDate: p.startDate || '2025-09-01',
    goLiveDate: p.goLiveDate || '2026-12-15',
    supportPoc: p.supportPoc || 'Rachel Adams (Tier 1)',
    sslPem: p.sslPem || 'DigiCert Wildcard 2026',
    tam: p.tam || (p.tamDetails ? p.tamDetails.split('(')[0].trim() : 'Devon Vance'),
  };
};

export const CustomerOnboardingScreen = ({
  projects = [],
  onNavigate,
  searchQuery = '',
  currentUser,
  onRoleChange,
}) => {
  // Initialize onboarding projects list
  const [sheetData, setSheetData] = useState(() => {
    const baseList = loadOnboardingProjects();
    if (projects && projects.length > 0) {
      // Merge unique projects from props with the defaults
      const mappedProps = projects.map(normalizeProject);
      const existingIds = new Set(mappedProps.map((p) => p.id));
      const filteredDefaults = baseList.filter((p) => !existingIds.has(p.id));
      return [...mappedProps, ...filteredDefaults];
    }
    return baseList;
  });

  // Track original snapshot for dirty/modified cell indicators & discard
  const [originalData, setOriginalData] = useState(() => sheetData);
  const [dirtyCells, setDirtyCells] = useState({}); // key: `${rowId}_${colKey}`
  const [toastMessage, setToastMessage] = useState(null);

  // Role-Based Access Control State
  // Roles: 'Admin User' | 'Power User' | 'SME User' | 'Edit Sheet User' | 'Read-only User' | 'No Role'
  const [currentUserRole, setCurrentUserRole] = useState(() => currentUser?.role || 'Admin User');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Sync with currentUser prop
  useEffect(() => {
    if (currentUser?.role) {
      setCurrentUserRole(currentUser.role);
    }
  }, [currentUser?.role]);

  // Sync with incoming projects prop
  useEffect(() => {
    if (projects && projects.length > 0) {
      const mappedProps = projects.map(normalizeProject);
      setSheetData((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = mappedProps.filter((p) => !existingIds.has(p.id));
        if (newOnes.length > 0) {
          return [...newOnes, ...prev];
        }
        return prev;
      });
    }
  }, [projects]);

  const handleRoleSelect = (roleName) => {
    setCurrentUserRole(roleName);
    setShowRoleMenu(false);
    if (onRoleChange) onRoleChange(roleName);
  };

  // Filter States
  const [typeCardFilter, setTypeCardFilter] = useState('ALL'); // 'ALL' | 'New Implementation' | 'Upgrade' | 'J2C'
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const [filterSolution, setFilterSolution] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTransitioned, setFilterTransitioned] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [filterLocation, setFilterLocation] = useState('ALL');
  const [filterTShirt, setFilterTShirt] = useState('ALL');
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [filterTam, setFilterTam] = useState('ALL');

  // Sorting
  const [sortColumn, setSortColumn] = useState('customer');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Inline editing active cell
  const [editingCell, setEditingCell] = useState(null); // { rowId, colKey }

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Determine permissions based on Role
  const canEdit = useMemo(() => {
    if (currentUserRole === 'No Role' || currentUserRole === 'Read-Only User' || currentUserRole === 'Read-only User') return false;
    return true;
  }, [currentUserRole]);

  const canCreateOB = useMemo(() => {
    return currentUserRole === 'Admin User' || currentUserRole === 'Power User';
  }, [currentUserRole]);

  // Check if current user has permission to edit this specific customer row
  const canEditRow = (row) => {
    if (!canEdit) return false;
    if (currentUserRole === 'Admin User' || currentUserRole === 'Power User' || currentUserRole === 'Edit Sheet User') {
      return true;
    }
    if (currentUserRole === 'SME User') {
      const assigned = currentUser?.assignedCustomers || ['Customer 1', 'Customer 2', 'Customer 3'];
      if (assigned.includes('All Customers')) return true;
      return assigned.includes(row?.customer);
    }
    return false;
  };

  // -------------------------------------------------------------
  // 1. TOP SUMMARY CARDS (DYNAMIC PROJECT TYPE COUNTS)
  // -------------------------------------------------------------
  const summaryCounts = useMemo(() => {
    let newImpl = 0;
    let upgrade = 0;
    let j2c = 0;

    sheetData.forEach((p) => {
      if (p.type === 'New Implementation') newImpl++;
      else if (p.type === 'Upgrade') upgrade++;
      else if (p.type === 'J2C') j2c++;
    });

    return {
      newImpl,
      upgrade,
      j2c,
      total: sheetData.length,
    };
  }, [sheetData]);

  // Handle Summary Card Click (Filter driver)
  const handleCardClick = (type) => {
    if (type === 'ALL') {
      setTypeCardFilter('ALL');
    } else if (typeCardFilter === type) {
      setTypeCardFilter('ALL'); // toggle off
    } else {
      setTypeCardFilter(type);
    }
  };

  // -------------------------------------------------------------
  // 2. FILTERING & SORTING DATA
  // -------------------------------------------------------------
  const filteredData = useMemo(() => {
    return sheetData.filter((row) => {
      // Summary Card filter
      if (typeCardFilter !== 'ALL' && row.type !== typeCardFilter) {
        return false;
      }

      // Search by Customer, Version, Project L3, Secondary SME
      const query = (localSearch || searchQuery).trim().toLowerCase();
      if (query) {
        const matchCustomer = row.customer?.toLowerCase().includes(query);
        const matchVersion = row.version?.toLowerCase().includes(query);
        const matchL3 = row.projectL3?.toLowerCase().includes(query);
        const matchSme = row.secondarySme?.toLowerCase().includes(query);
        if (!matchCustomer && !matchVersion && !matchL3 && !matchSme) {
          return false;
        }
      }

      // Dropdown filters
      if (filterSolution !== 'ALL' && row.solution !== filterSolution) return false;
      if (filterStatus !== 'ALL' && row.status !== filterStatus) return false;
      if (filterTransitioned !== 'ALL' && row.transitioned !== filterTransitioned) return false;
      if (filterTeam !== 'ALL' && row.implementationTeam !== filterTeam) return false;
      if (filterLocation !== 'ALL' && row.location !== filterLocation) return false;
      if (filterTShirt !== 'ALL' && row.tShirtSize !== filterTShirt) return false;
      if (filterPlatform !== 'ALL' && row.platform !== filterPlatform) return false;
      if (filterTam !== 'ALL' && row.tam !== filterTam) return false;

      return true;
    });
  }, [
    sheetData,
    typeCardFilter,
    localSearch,
    searchQuery,
    filterSolution,
    filterStatus,
    filterTransitioned,
    filterTeam,
    filterLocation,
    filterTShirt,
    filterPlatform,
    filterTam,
  ]);

  const sortedData = useMemo(() => {
    const list = [...filteredData];
    if (!sortColumn) return list;

    list.sort((a, b) => {
      const aVal = a[sortColumn] ?? '';
      const bVal = b[sortColumn] ?? '';

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [filteredData, sortColumn, sortDirection]);

  // Sort toggle handler
  const handleSort = (colKey) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(colKey);
      setSortDirection('asc');
    }
  };

  // -------------------------------------------------------------
  // 3. CELL EDITING & SHEET OPERATIONS
  // -------------------------------------------------------------
  const handleCellChange = (rowId, colKey, newValue) => {
    if (!canEdit) return;

    setSheetData((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return { ...row, [colKey]: newValue };
        }
        return row;
      })
    );

    // Track dirty cell against original
    const origRow = originalData.find((r) => r.id === rowId);
    const origVal = origRow ? origRow[colKey] : undefined;
    const cellKey = `${rowId}_${colKey}`;

    setDirtyCells((prev) => {
      if (origVal === newValue) {
        const copy = { ...prev };
        delete copy[cellKey];
        return copy;
      }
      return { ...prev, [cellKey]: true };
    });
  };

  const handleSaveAll = () => {
    setOriginalData([...sheetData]);
    setDirtyCells({});
    saveOnboardingProjects(sheetData);
    showToast(`Successfully saved ${Object.keys(dirtyCells).length} modified cell(s).`);
  };

  const handleDiscardAll = () => {
    setSheetData([...originalData]);
    setDirtyCells({});
    showToast('All unsaved edits have been discarded.');
  };

  // Add new blank row inline
  const handleAddRow = () => {
    if (!canEdit) return;
    const newId = `p-${Date.now()}`;
    const newProjectRow = {
      id: newId,
      customer: 'Customer 1',
      solution: 'Category Management',
      type: 'New Implementation',
      status: 'In Progress',
      transitioned: 'No',
      implementationTeam: 'Cloud Delivery Pod Alpha',
      version: '2026.1.0',
      projectL3: 'Alex Vance',
      location: 'Dallas, TX',
      secondarySme: 'Elena Rostova',
      tShirtSize: 'Medium',
      noOfSubscriptions: 10,
      platform: 'Azure Cloud',
      startDate: new Date().toISOString().split('T')[0],
      goLiveDate: '2026-12-31',
      supportPoc: 'Rachel Adams (Tier 1)',
      sslPem: 'DigiCert Wildcard 2026',
      tam: 'Devon Vance',
    };

    setSheetData((prev) => [newProjectRow, ...prev]);
    setDirtyCells((prev) => ({ ...prev, [`${newId}_customer`]: true }));
    showToast('New onboarding project row added. Edit fields directly in the sheet.');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Customer',
      'Solution',
      'Type',
      'Status',
      'Transitioned',
      'Implementation Team',
      'Version',
      'Project L3',
      'Location',
      'Secondary SME',
      'T-Shirt Size',
      'No Of Subscriptions',
      'Platform',
      'Start Date',
      'Go-live Date',
      'Support POC / Transition',
      'SSL/PEM',
      'TAM',
    ];

    const rows = sortedData.map((r) => [
      `"${r.customer}"`,
      `"${r.solution}"`,
      `"${r.type}"`,
      `"${r.status}"`,
      `"${r.transitioned}"`,
      `"${r.implementationTeam}"`,
      `"${r.version}"`,
      `"${r.projectL3}"`,
      `"${r.location}"`,
      `"${r.secondarySme}"`,
      `"${r.tShirtSize}"`,
      r.noOfSubscriptions,
      `"${r.platform}"`,
      r.startDate,
      r.goLiveDate,
      `"${r.supportPoc}"`,
      `"${r.sslPem}"`,
      `"${r.tam}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IntelliOnboard_Projects_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dropdown lists
  const solutionOptions = ['Category Management', 'Assortment & Space Planning', 'Demand & Inventory', 'Floor Planning', 'Enterprise Supply Chain'];
  const typeOptions = ['New Implementation', 'Upgrade', 'J2C'];
  const statusOptions = ['In Progress', 'Completed'];
  const transitionedOptions = ['Yes', 'No'];
  const tShirtOptions = ['Very Small', 'Small', 'Medium', 'Large', 'Very Large'];
  const platformOptions = ['Azure Cloud', 'BY Cloud', 'AWS', 'GCP', 'On-Premise'];

  // Reset all filters
  const resetFilters = () => {
    setTypeCardFilter('ALL');
    setLocalSearch('');
    setFilterSolution('ALL');
    setFilterStatus('ALL');
    setFilterTransitioned('ALL');
    setFilterTeam('ALL');
    setFilterLocation('ALL');
    setFilterTShirt('ALL');
    setFilterPlatform('ALL');
    setFilterTam('ALL');
  };

  const hasActiveFilters =
    typeCardFilter !== 'ALL' ||
    localSearch !== '' ||
    filterSolution !== 'ALL' ||
    filterStatus !== 'ALL' ||
    filterTransitioned !== 'ALL' ||
    filterTeam !== 'ALL' ||
    filterLocation !== 'ALL' ||
    filterTShirt !== 'ALL' ||
    filterPlatform !== 'ALL' ||
    filterTam !== 'ALL';

  const dirtyCount = Object.keys(dirtyCells).length;

  // -------------------------------------------------------------
  // NO ROLE ACCESS CONTROL SCREEN
  // -------------------------------------------------------------
  if (currentUserRole === 'No Role') {
    return (
      <div className="w-full min-h-screen bg-[#F5FAFD] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-lg border border-[#e6eeff] text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[30px]">lock</span>
          </div>
          <h2 className="text-xl font-bold text-[#121c2a] mb-2">Access Restricted</h2>
          <p className="text-xs text-[#6d7980] leading-relaxed mb-6">
            You do not have authorization to view or edit the <strong>Customer Onboarding Sheet</strong>.
            Please switch to an active authorized role or contact your system administrator.
          </p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setCurrentUserRole('Admin User')}
              className="w-full py-2.5 rounded-xl bg-[#004B87] hover:bg-[#003966] text-white text-xs font-bold transition-all cursor-pointer"
            >
              Switch to Admin User
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full py-2.5 rounded-xl border border-[#d3e4ff] text-[#3d484f] text-xs font-bold hover:bg-[#eff4ff] transition-all cursor-pointer"
            >
              Return to Operations Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F5FAFD] pb-16">
      <div className="px-6 lg:px-8 py-6 max-w-[1720px] mx-auto w-full flex flex-col gap-6">

        {/* ------------------------------------------------------- */}
        {/* PAGE HEADER & WORKSPACE TOOLBAR                         */}
        {/* ------------------------------------------------------- */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-widest text-[#006688] font-bold">
                Project Management Workspace
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b7f1]"></span>
              <span className="text-[11px] text-[#6d7980] font-mono">
                Master_Onboarding_Sheet.xlsx
              </span>
            </div>
            <h1 className="text-[26px] text-[#121c2a] font-bold tracking-tight">
              Customer Onboarding
            </h1>
            <p className="text-xs text-[#3d484f]">
              Excel-grade project management sheet for CATMAN customer deployments. Click any customer to open master record in Customer Details.
            </p>
          </div>

          {/* Right Action Group: + Start New OB */}
          <div className="flex flex-wrap items-center gap-3">
            {/* + Start New OB Workflow Button (Hidden for Read-only, SME, Edit Sheet, No Role) */}
            {canCreateOB && (
              <button
                type="button"
                onClick={() => onNavigate('start-new-ob')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#004B87] via-[#0b5c9e] to-[#00b7f1] text-white text-xs font-bold shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.99] transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Start New OB</span>
              </button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* 1. TOP SUMMARY CARDS (DYNAMIC PROJECT TYPE COUNTS)      */}
        {/* ------------------------------------------------------- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: New Implementation */}
          <div
            onClick={() => handleCardClick('New Implementation')}
            className={`rounded-2xl p-5 bg-white border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              typeCardFilter === 'New Implementation'
                ? 'ring-2 ring-[#00b7f1] border-[#00b7f1] bg-[#f0f9ff]'
                : 'border-[#e6eeff] hover:border-[#00b7f1]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#6d7980] font-bold">
                1. New Implementation
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#c2e8ff] text-[#004d67] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">add_box</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-[#004B87] leading-none">
                {summaryCounts.newImpl}
              </span>
              <span className="text-[11px] font-bold text-[#006688] flex items-center gap-1">
                {typeCardFilter === 'New Implementation' ? 'Active Filter • Click to clear' : 'Click to filter'}
              </span>
            </div>
          </div>

          {/* Card 2: Upgrade */}
          <div
            onClick={() => handleCardClick('Upgrade')}
            className={`rounded-2xl p-5 bg-white border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              typeCardFilter === 'Upgrade'
                ? 'ring-2 ring-[#27609d] border-[#27609d] bg-[#eff4ff]'
                : 'border-[#e6eeff] hover:border-[#27609d]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#6d7980] font-bold">
                2. Upgrade
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#d3e4ff] text-[#004a86] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">upgrade</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-[#004B87] leading-none">
                {summaryCounts.upgrade}
              </span>
              <span className="text-[11px] font-bold text-[#27609d] flex items-center gap-1">
                {typeCardFilter === 'Upgrade' ? 'Active Filter • Click to clear' : 'Click to filter'}
              </span>
            </div>
          </div>

          {/* Card 3: J2C */}
          <div
            onClick={() => handleCardClick('J2C')}
            className={`rounded-2xl p-5 bg-white border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              typeCardFilter === 'J2C'
                ? 'ring-2 ring-[#0284c7] border-[#0284c7] bg-[#f0f9ff]'
                : 'border-[#e6eeff] hover:border-[#0284c7]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#6d7980] font-bold">
                3. J2C
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0369a1] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">cloud_sync</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-[#004B87] leading-none">
                {summaryCounts.j2c}
              </span>
              <span className="text-[11px] font-bold text-[#0284c7] flex items-center gap-1">
                {typeCardFilter === 'J2C' ? 'Active Filter • Click to clear' : 'Click to filter'}
              </span>
            </div>
          </div>

          {/* Card 4: Total Projects */}
          <div
            onClick={() => handleCardClick('ALL')}
            className={`rounded-2xl p-5 bg-white border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
              typeCardFilter === 'ALL'
                ? 'ring-2 ring-[#004B87] border-[#004B87] bg-[#f8fbfe]'
                : 'border-[#e6eeff] hover:border-[#004B87]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#6d7980] font-bold">
                4. Total Projects
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#004B87] flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[34px] font-black text-[#004B87] leading-none">
                {summaryCounts.total}
              </span>
              <span className="text-[11px] font-bold text-[#004B87] flex items-center gap-1">
                {typeCardFilter === 'ALL' ? 'Showing All Projects' : 'Click to show all'}
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* EXCEL ACTIONS BAR: SEARCH, FILTERS & SHEET CONTROLS      */}
        {/* ------------------------------------------------------- */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e6eeff] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search by Customer, Version, Project L3, Secondary SME */}
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6d7980] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search Customer, Version, Project L3, Secondary SME..."
                className="w-full pl-9 pr-8 py-2 bg-[#eff4ff] rounded-xl text-xs text-[#121c2a] placeholder:text-[#6d7980] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] border border-[#d3e4ff] focus:border-[#00b7f1] transition-all"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="absolute right-2.5 top-2.5 text-[#6d7980] hover:text-[#121c2a] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>

            {/* Filters toggle button */}
            <button
              type="button"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                hasActiveFilters
                  ? 'bg-[#004B87] text-white border-[#004B87]'
                  : 'bg-white text-[#3d484f] border-[#d3e4ff] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#00b7f1]"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-[#006688] hover:underline font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sheet Actions: Save, Discard, Add Row, Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            {dirtyCount > 0 && canEdit && (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#fef3c7] text-[#92400e] text-xs font-bold border border-[#fde68a]">
                  <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></span>
                  <span>{dirtyCount} unsaved change{dirtyCount > 1 ? 's' : ''}</span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22C55E] hover:bg-[#16a34a] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  <span>Save Changes</span>
                </button>

                <button
                  type="button"
                  onClick={handleDiscardAll}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#d3e4ff] bg-white text-[#6d7980] hover:text-[#121c2a] text-xs font-bold hover:bg-[#eff4ff] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">undo</span>
                  <span>Discard</span>
                </button>
              </>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={handleAddRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#004B87] text-[#004B87] hover:bg-[#eff4ff] text-xs font-bold transition-colors cursor-pointer"
                title="Add a new onboarding project row to the spreadsheet"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Add Row</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#d3e4ff] bg-white text-[#3d484f] hover:bg-[#eff4ff] text-xs font-bold transition-colors cursor-pointer"
              title="Download spreadsheet as CSV"
            >
              <span className="material-symbols-outlined text-[18px] text-[#004B87]">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------- */}
        {/* COLLAPSIBLE FILTERS PANEL                                */}
        {/* ------------------------------------------------------- */}
        {showFiltersPanel && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6eeff] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#121c2a] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#004B87]">tune</span>
                Column Filters
              </span>
              <button
                type="button"
                onClick={() => setShowFiltersPanel(false)}
                className="text-[#6d7980] hover:text-[#121c2a] text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
              {/* Solution */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">Solution</label>
                <select
                  value={filterSolution}
                  onChange={(e) => setFilterSolution(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All Solutions</option>
                  <option value="Category Management">Category Management</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">Type</label>
                <select
                  value={typeCardFilter}
                  onChange={(e) => setTypeCardFilter(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All Types</option>
                  <option value="New Implementation">New Implementation</option>
                  <option value="Upgrade">Upgrade</option>
                  <option value="J2C">J2C</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Transitioned */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">Transitioned</label>
                <select
                  value={filterTransitioned}
                  onChange={(e) => setFilterTransitioned(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* T-Shirt Size */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">T-Shirt Size</label>
                <select
                  value={filterTShirt}
                  onChange={(e) => setFilterTShirt(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All Sizes</option>
                  {tShirtOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">Platform</label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All Platforms</option>
                  {platformOptions.map((pl) => (
                    <option key={pl} value={pl}>{pl}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">Location</label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All Locations</option>
                  {Array.from(new Set(sheetData.map((p) => p.location))).map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* TAM */}
              <div>
                <label className="block text-[10px] font-bold text-[#6d7980] uppercase mb-1">TAM</label>
                <select
                  value={filterTam}
                  onChange={(e) => setFilterTam(e.target.value)}
                  className="w-full px-2 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="ALL">All TAMs</option>
                  {Array.from(new Set(sheetData.map((p) => p.tam))).map((tam) => (
                    <option key={tam} value={tam}>{tam}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------- */}
        {/* 2. MAIN EXCEL-STYLE ONBOARDING SHEET                    */}
        {/* ------------------------------------------------------- */}
        <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,75,135,0.06)] border border-[#e6eeff] overflow-hidden flex flex-col">
          
          {/* Spreadsheet Title Bar */}
          <div className="px-5 py-3 bg-[#f8fbfe] border-b border-[#e6eeff] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#004B87]">grid_on</span>
              <span className="font-bold text-[#121c2a]">Onboarding Project Ledger</span>
              <span className="text-[#6d7980]">
                ({sortedData.length} of {sheetData.length} rows displayed)
              </span>
            </div>

            {!canEdit && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#6d7980] bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#d3e4ff]">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                Read-Only View
              </span>
            )}
          </div>

          {/* Spreadsheet Table Container (Horizontal & Vertical Scrollable, Sticky Headers) */}
          <div className="relative overflow-x-auto overflow-y-auto max-h-[640px] border-b border-[#e6eeff]">
            <table className="w-full min-w-[2450px] border-collapse text-left text-xs font-sans">
              
              {/* Sticky Header Row with Exact 18 Columns */}
              <thead className="sticky top-0 z-20 bg-[#eff4ff] text-[#004B87] shadow-xs">
                <tr className="border-b border-[#d3e4ff]">
                  {/* Row index indicator header */}
                  <th className="w-12 px-2.5 py-3 text-center text-[11px] font-mono font-bold text-[#6d7980] border-r border-[#d3e4ff] bg-[#e6eeff] select-none">
                    #
                  </th>

                  {/* 1. Customer */}
                  <th
                    onClick={() => handleSort('customer')}
                    className="w-48 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>1. Customer</span>
                      {sortColumn === 'customer' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 2. Solution */}
                  <th
                    onClick={() => handleSort('solution')}
                    className="w-48 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>2. Solution</span>
                      {sortColumn === 'solution' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 3. Type */}
                  <th
                    onClick={() => handleSort('type')}
                    className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>3. Type</span>
                      {sortColumn === 'type' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 4. Status */}
                  <th
                    onClick={() => handleSort('status')}
                    className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>4. Status</span>
                      {sortColumn === 'status' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 5. Transitioned */}
                  <th
                    onClick={() => handleSort('transitioned')}
                    className="w-32 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>5. Transitioned</span>
                      {sortColumn === 'transitioned' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 6. Implementation Team */}
                  <th
                    onClick={() => handleSort('implementationTeam')}
                    className="w-52 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>6. Implementation Team</span>
                      {sortColumn === 'implementationTeam' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 7. Version */}
                  <th
                    onClick={() => handleSort('version')}
                    className="w-32 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>7. Version</span>
                      {sortColumn === 'version' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 8. Project L3 */}
                  <th
                    onClick={() => handleSort('projectL3')}
                    className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>8. Project L3</span>
                      {sortColumn === 'projectL3' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 9. Location */}
                  <th
                    onClick={() => handleSort('location')}
                    className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>9. Location</span>
                      {sortColumn === 'location' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 10. Secondary SME */}
                  <th
                    onClick={() => handleSort('secondarySme')}
                    className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>10. Secondary SME</span>
                      {sortColumn === 'secondarySme' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 11. T-Shirt Size */}
                  <th
                    onClick={() => handleSort('tShirtSize')}
                    className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>11. T-Shirt Size</span>
                      {sortColumn === 'tShirtSize' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 12. No Of Subscriptions */}
                  <th
                    onClick={() => handleSort('noOfSubscriptions')}
                    className="w-40 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>12. No Of Subs</span>
                      {sortColumn === 'noOfSubscriptions' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 13. Platform */}
                  <th
                    onClick={() => handleSort('platform')}
                    className="w-40 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>13. Platform</span>
                      {sortColumn === 'platform' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 14. Start Date */}
                  <th
                    onClick={() => handleSort('startDate')}
                    className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>14. Start Date</span>
                      {sortColumn === 'startDate' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 15. Go-live Date */}
                  <th
                    onClick={() => handleSort('goLiveDate')}
                    className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>15. Go-live Date</span>
                      {sortColumn === 'goLiveDate' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 16. Support POC / Transition */}
                  <th
                    onClick={() => handleSort('supportPoc')}
                    className="w-52 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>16. Support POC</span>
                      {sortColumn === 'supportPoc' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 17. SSL/PEM */}
                  <th
                    onClick={() => handleSort('sslPem')}
                    className="w-48 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>17. SSL/PEM</span>
                      {sortColumn === 'sslPem' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>

                  {/* 18. TAM */}
                  <th
                    onClick={() => handleSort('tam')}
                    className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span>18. TAM</span>
                      {sortColumn === 'tam' && (
                        <span className="material-symbols-outlined text-[16px]">
                          {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                        </span>
                      )}
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Spreadsheet Body */}
              <tbody className="divide-y divide-[#e6eeff]">
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={19} className="py-12 text-center text-[#6d7980]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[32px] text-[#bcc8d0]">
                          search_off
                        </span>
                        <span className="font-semibold text-sm">No onboarding projects match your criteria</span>
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 text-xs text-[#004B87] font-bold hover:underline cursor-pointer"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedData.map((row, index) => {
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-[#f8fbfe] transition-colors group"
                      >
                        {/* Row Number */}
                        <td className="w-12 px-2.5 py-2 text-center text-[11px] font-mono text-[#6d7980] bg-[#f8fbfe] border-r border-[#e6eeff] select-none group-hover:bg-[#eff4ff]">
                          {index + 1}
                        </td>

                        {/* 1. Customer (Clickable Link to Customer Details) */}
                        <td
                          className={`w-48 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_customer`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_customer`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => onNavigate('customer-details', { customer: row.customer, customerName: row.customer })}
                              title={`Open Customer Details for ${row.customer}`}
                              className="text-[#004B87] hover:text-[#00b7f1] font-bold text-xs inline-flex items-center gap-1.5 hover:underline cursor-pointer group/link"
                            >
                              <span>{row.customer}</span>
                              <span className="material-symbols-outlined text-[14px] opacity-60 group-hover/link:opacity-100 transition-opacity">
                                open_in_new
                              </span>
                            </button>

                            {canEdit && (
                              <input
                                type="text"
                                value={row.customer}
                                onChange={(e) => handleCellChange(row.id, 'customer', e.target.value)}
                                className="hidden group-hover:inline-block w-14 text-[10px] px-1 py-0.5 border border-[#d3e4ff] rounded bg-white font-mono"
                                title="Edit Customer Code"
                              />
                            )}
                          </div>
                        </td>

                        {/* 2. Solution */}
                        <td
                          className={`w-48 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_solution`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_solution`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <select
                              value={row.solution}
                              onChange={(e) => handleCellChange(row.id, 'solution', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] font-medium py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer"
                            >
                              {solutionOptions.map((sol) => (
                                <option key={sol} value={sol}>{sol}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-[#121c2a]">{row.solution}</span>
                          )}
                        </td>

                        {/* 3. Type */}
                        <td
                          className={`w-44 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_type`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_type`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <select
                              value={row.type}
                              onChange={(e) => handleCellChange(row.id, 'type', e.target.value)}
                              className={`w-full text-xs font-bold py-1 px-1.5 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer ${
                                row.type === 'New Implementation'
                                  ? 'bg-[#c2e8ff]/50 text-[#004d67]'
                                  : row.type === 'Upgrade'
                                  ? 'bg-[#d3e4ff]/60 text-[#004a86]'
                                  : 'bg-[#e0f2fe] text-[#0369a1]'
                              }`}
                            >
                              {typeOptions.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#eff4ff] text-[#004B87] border border-[#d3e4ff]">
                              {row.type}
                            </span>
                          )}
                        </td>

                        {/* 4. Status */}
                        <td
                          className={`w-36 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_status`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_status`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <select
                              value={row.status}
                              onChange={(e) => handleCellChange(row.id, 'status', e.target.value)}
                              className={`w-full text-xs font-bold py-1 px-1.5 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer ${
                                row.status === 'Completed'
                                  ? 'bg-[#dcfce7] text-[#15803d]'
                                  : 'bg-[#fef3c7] text-[#92400e]'
                              }`}
                            >
                              {statusOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                row.status === 'Completed'
                                  ? 'bg-[#dcfce7] text-[#15803d]'
                                  : 'bg-[#fef3c7] text-[#92400e]'
                              }`}
                            >
                              {row.status}
                            </span>
                          )}
                        </td>

                        {/* 5. Transitioned */}
                        <td
                          className={`w-32 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_transitioned`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_transitioned`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <select
                              value={row.transitioned}
                              onChange={(e) => handleCellChange(row.id, 'transitioned', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] font-medium py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer"
                            >
                              {transitionedOptions.map((tr) => (
                                <option key={tr} value={tr}>{tr}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-[#121c2a]">{row.transitioned}</span>
                          )}
                        </td>

                        {/* 6. Implementation Team */}
                        <td
                          className={`w-52 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_implementationTeam`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_implementationTeam`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.implementationTeam}
                              onChange={(e) => handleCellChange(row.id, 'implementationTeam', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs text-[#121c2a] truncate block">{row.implementationTeam}</span>
                          )}
                        </td>

                        {/* 7. Version */}
                        <td
                          className={`w-32 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_version`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_version`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.version}
                              onChange={(e) => handleCellChange(row.id, 'version', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs font-mono text-[#004B87] font-semibold py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs font-mono font-semibold text-[#004B87]">{row.version}</span>
                          )}
                        </td>

                        {/* 8. Project L3 */}
                        <td
                          className={`w-44 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_projectL3`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_projectL3`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.projectL3}
                              onChange={(e) => handleCellChange(row.id, 'projectL3', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs text-[#121c2a]">{row.projectL3}</span>
                          )}
                        </td>

                        {/* 9. Location */}
                        <td
                          className={`w-36 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_location`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_location`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.location}
                              onChange={(e) => handleCellChange(row.id, 'location', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs text-[#121c2a]">{row.location}</span>
                          )}
                        </td>

                        {/* 10. Secondary SME */}
                        <td
                          className={`w-44 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_secondarySme`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_secondarySme`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.secondarySme}
                              onChange={(e) => handleCellChange(row.id, 'secondarySme', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs text-[#121c2a]">{row.secondarySme}</span>
                          )}
                        </td>

                        {/* 11. T-Shirt Size */}
                        <td
                          className={`w-36 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_tShirtSize`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_tShirtSize`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <select
                              value={row.tShirtSize}
                              onChange={(e) => handleCellChange(row.id, 'tShirtSize', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs font-semibold text-[#004B87] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer"
                            >
                              {tShirtOptions.map((ts) => (
                                <option key={ts} value={ts}>{ts}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs font-bold text-[#004B87]">{row.tShirtSize}</span>
                          )}
                        </td>

                        {/* 12. No Of Subscriptions */}
                        <td
                          className={`w-40 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_noOfSubscriptions`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_noOfSubscriptions`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="number"
                              min={1}
                              value={row.noOfSubscriptions}
                              onChange={(e) => handleCellChange(row.id, 'noOfSubscriptions', parseInt(e.target.value) || 0)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs font-mono font-bold text-[#121c2a] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs font-mono font-bold text-[#121c2a]">{row.noOfSubscriptions}</span>
                          )}
                        </td>

                        {/* 13. Platform */}
                        <td
                          className={`w-40 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_platform`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_platform`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <select
                              value={row.platform}
                              onChange={(e) => handleCellChange(row.id, 'platform', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer"
                            >
                              {platformOptions.map((pl) => (
                                <option key={pl} value={pl}>{pl}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-[#121c2a]">{row.platform}</span>
                          )}
                        </td>

                        {/* 14. Start Date */}
                        <td
                          className={`w-36 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_startDate`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_startDate`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="date"
                              value={row.startDate}
                              onChange={(e) => handleCellChange(row.id, 'startDate', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-[11px] font-mono text-[#3d484f] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer"
                            />
                          ) : (
                            <span className="text-[11px] font-mono text-[#3d484f]">{row.startDate}</span>
                          )}
                        </td>

                        {/* 15. Go-live Date */}
                        <td
                          className={`w-36 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_goLiveDate`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_goLiveDate`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="date"
                              value={row.goLiveDate}
                              onChange={(e) => handleCellChange(row.id, 'goLiveDate', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-[11px] font-mono text-[#004B87] font-semibold py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors cursor-pointer"
                            />
                          ) : (
                            <span className="text-[11px] font-mono font-semibold text-[#004B87]">{row.goLiveDate}</span>
                          )}
                        </td>

                        {/* 16. Support POC / Transition */}
                        <td
                          className={`w-52 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_supportPoc`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_supportPoc`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.supportPoc}
                              onChange={(e) => handleCellChange(row.id, 'supportPoc', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs text-[#121c2a]">{row.supportPoc}</span>
                          )}
                        </td>

                        {/* 17. SSL/PEM (No sensitive content exposed) */}
                        <td
                          className={`w-48 px-3.5 py-2 border-r border-[#e6eeff] relative ${
                            dirtyCells[`${row.id}_sslPem`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_sslPem`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.sslPem}
                              onChange={(e) => handleCellChange(row.id, 'sslPem', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs font-mono text-[#3d484f] py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                              placeholder="e.g. DigiCert Wildcard 2026"
                            />
                          ) : (
                            <span className="text-xs font-mono text-[#3d484f] truncate block">{row.sslPem}</span>
                          )}
                        </td>

                        {/* 18. TAM */}
                        <td
                          className={`w-44 px-3.5 py-2 relative ${
                            dirtyCells[`${row.id}_tam`] ? 'bg-[#eff8ff]' : ''
                          }`}
                        >
                          {dirtyCells[`${row.id}_tam`] && (
                            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#00b7f1]" />
                          )}
                          {canEdit ? (
                            <input
                              type="text"
                              value={row.tam}
                              onChange={(e) => handleCellChange(row.id, 'tam', e.target.value)}
                              className="w-full bg-transparent hover:bg-white focus:bg-white text-xs text-[#121c2a] font-medium py-1 px-1 rounded border border-transparent hover:border-[#d3e4ff] focus:border-[#00b7f1] outline-none transition-colors"
                            />
                          ) : (
                            <span className="text-xs text-[#121c2a] font-medium">{row.tam}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Excel Status Bar (Bottom Sheet Footer) */}
          <div className="px-5 py-2.5 bg-[#f8fbfe] border-t border-[#e6eeff] flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#6d7980] gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#004B87] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                Ready
              </span>
              <span>Total: {sheetData.length} projects</span>
              <span>Filtered: {sortedData.length} records</span>
              {dirtyCount > 0 && (
                <span className="text-[#f59e0b] font-bold">
                  • {dirtyCount} modified field{dirtyCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#6d7980]">
                Sorted by <strong>{sortColumn}</strong> ({sortDirection})
              </span>
              <span>•</span>
              <span className="text-[#006688]">Zoom: 100%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121c2a] text-white px-4 py-2.5 rounded-xl shadow-xl border border-white/10 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 text-xs font-medium">
          <span className="material-symbols-outlined text-[18px] text-[#22C55E]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
