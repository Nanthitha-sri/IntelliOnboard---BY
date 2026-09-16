import React, { useState, useEffect, useMemo } from 'react';
import {
  getCustomerMeta,
  saveCustomerMeta,
  loadOnboardingProjects,
  saveOnboardingProjects,
  loadCustomerRegistry,
} from '../data/customerStore.js';

export const CustomerDetailsScreen = ({
  projects: initialProjects = [],
  onNavigate,
  selectedCustomer = 'Customer 1',
  currentUser,
  onRoleChange,
}) => {
  // -------------------------------------------------------------
  // STATE: Active Selected Customer & Data Store
  // -------------------------------------------------------------
  const [activeCustomer, setActiveCustomer] = useState(() => selectedCustomer || 'Customer 1');
  const [allProjects, setAllProjects] = useState(() => loadOnboardingProjects());
  const [customerMeta, setCustomerMeta] = useState(() => getCustomerMeta(selectedCustomer || 'Customer 1'));

  // Synchronize when selectedCustomer prop updates
  useEffect(() => {
    if (selectedCustomer) {
      setActiveCustomer(selectedCustomer);
      setCustomerMeta(getCustomerMeta(selectedCustomer));
    }
  }, [selectedCustomer]);

  // Available customers list for quick switching
  const customerList = useMemo(() => {
    const registry = loadCustomerRegistry();
    const fromProjects = allProjects.map((p) => p.customer).filter(Boolean);
    const set = new Set([...Object.keys(registry), ...fromProjects]);
    return Array.from(set).sort();
  }, [allProjects]);

  // Handle switching active customer
  const handleCustomerChange = (newCustomerName) => {
    setActiveCustomer(newCustomerName);
    setCustomerMeta(getCustomerMeta(newCustomerName));
    setSelectedProjectTab('ALL');
    setExpandedProjectId(null);
  };

  // -------------------------------------------------------------
  // Filter all projects to strictly the selected customer
  // -------------------------------------------------------------
  const customerProjects = useMemo(() => {
    return allProjects.filter(
      (p) => (p.customer || '').toLowerCase() === activeCustomer.toLowerCase()
    );
  }, [allProjects, activeCustomer]);

  // Selected project tab: 'ALL' or specific projectId
  const [selectedProjectTab, setSelectedProjectTab] = useState('ALL');
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  // Search & Filter state for this customer's projects
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTransitioned, setFilterTransitioned] = useState('ALL');
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [filterTShirt, setFilterTShirt] = useState('ALL');
  const [filterVersion, setFilterVersion] = useState('ALL');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState('projectNumber');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' | 'desc'

  // Role-Based Access Control State
  // Roles: 'Admin User' | 'Power User' | 'SME User' | 'Edit Sheet User' | 'Read-only User' | 'No Role'
  const [currentUserRole, setCurrentUserRole] = useState(() => currentUser?.role || 'Admin User');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    if (currentUser?.role) {
      setCurrentUserRole(currentUser.role);
    }
  }, [currentUser?.role]);

  const canEdit = useMemo(() => {
    if (currentUserRole === 'No Role' || currentUserRole === 'Read-Only User' || currentUserRole === 'Read-only User') return false;
    if (currentUserRole === 'Admin User' || currentUserRole === 'Power User' || currentUserRole === 'Edit Sheet User') return true;
    if (currentUserRole === 'SME User') {
      const assigned = currentUser?.assignedCustomers || ['Customer 1', 'Customer 2', 'Customer 3'];
      if (assigned.includes('All Customers')) return true;
      return assigned.includes(activeCustomer);
    }
    return false;
  }, [currentUserRole, currentUser, activeCustomer]);

  // Toast notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Modals state
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [customerEditForm, setCustomerEditForm] = useState({
    customerName: '',
    customerCode: '',
    jpowerId: '',
  });

  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [projectForm, setProjectForm] = useState(null);

  // -------------------------------------------------------------
  // Filtered and Sorted Projects for the Customer
  // -------------------------------------------------------------
  const displayedProjects = useMemo(() => {
    let result = [...customerProjects];

    // Filter by selected project tab if not ALL
    if (selectedProjectTab !== 'ALL') {
      result = result.filter((p) => p.id === selectedProjectTab);
    }

    // Keyword search across project attributes
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          (p.projectNumber && p.projectNumber.toLowerCase().includes(q)) ||
          (p.version && p.version.toLowerCase().includes(q)) ||
          (p.projectL3 && p.projectL3.toLowerCase().includes(q)) ||
          (p.secondarySme && p.secondarySme.toLowerCase().includes(q)) ||
          (p.implementationTeam && p.implementationTeam.toLowerCase().includes(q)) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.tam && p.tam.toLowerCase().includes(q)) ||
          (p.solution && p.solution.toLowerCase().includes(q))
      );
    }

    // Type filter
    if (filterType !== 'ALL') {
      result = result.filter((p) => p.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      result = result.filter((p) => p.status === filterStatus);
    }

    // Transitioned filter
    if (filterTransitioned !== 'ALL') {
      result = result.filter((p) => p.transitioned === filterTransitioned);
    }

    // Platform filter
    if (filterPlatform !== 'ALL') {
      result = result.filter((p) => p.platform === filterPlatform);
    }

    // T-Shirt Size filter
    if (filterTShirt !== 'ALL') {
      result = result.filter((p) => p.tShirtSize === filterTShirt);
    }

    // Version filter
    if (filterVersion !== 'ALL') {
      result = result.filter((p) => p.version === filterVersion);
    }

    // Sorting
    result.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
      if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    customerProjects,
    selectedProjectTab,
    searchQuery,
    filterType,
    filterStatus,
    filterTransitioned,
    filterPlatform,
    filterTShirt,
    filterVersion,
    sortField,
    sortDirection,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('ALL');
    setFilterStatus('ALL');
    setFilterTransitioned('ALL');
    setFilterPlatform('ALL');
    setFilterTShirt('ALL');
    setFilterVersion('ALL');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    filterType !== 'ALL' ||
    filterStatus !== 'ALL' ||
    filterTransitioned !== 'ALL' ||
    filterPlatform !== 'ALL' ||
    filterTShirt !== 'ALL' ||
    filterVersion !== 'ALL';

  // -------------------------------------------------------------
  // CUSTOMER-LEVEL EDIT HANDLERS
  // -------------------------------------------------------------
  const handleOpenEditCustomer = () => {
    setCustomerEditForm({
      customerName: activeCustomer,
      customerCode: customerMeta.customerCode || 'B802',
      jpowerId: customerMeta.jpowerId || '44562',
    });
    setIsEditCustomerModalOpen(true);
  };

  const handleSaveCustomerMeta = (e) => {
    e.preventDefault();
    if (!customerEditForm.customerName.trim()) {
      alert('Customer Name cannot be empty');
      return;
    }

    const updated = saveCustomerMeta(customerEditForm.customerName.trim(), {
      customerCode: customerEditForm.customerCode.trim(),
      jpowerId: customerEditForm.jpowerId.trim(),
    });

    // If customer name was changed, update all projects for this customer as well
    if (customerEditForm.customerName.trim() !== activeCustomer) {
      const oldName = activeCustomer;
      const newName = customerEditForm.customerName.trim();
      const updatedProjects = allProjects.map((p) =>
        p.customer?.toLowerCase() === oldName.toLowerCase()
          ? { ...p, customer: newName }
          : p
      );
      setAllProjects(updatedProjects);
      saveOnboardingProjects(updatedProjects);
      setActiveCustomer(newName);
    }

    setCustomerMeta(updated);
    setIsEditCustomerModalOpen(false);
    showToast(`Customer metadata for "${customerEditForm.customerName.trim()}" saved successfully.`);
  };

  // -------------------------------------------------------------
  // PROJECT-LEVEL ADD & EDIT HANDLERS
  // -------------------------------------------------------------
  const handleOpenAddProject = () => {
    const nextIndex = customerProjects.length + 1;
    const formattedNum = `Project ${String(nextIndex).padStart(3, '0')}`;

    setProjectForm({
      id: `proj-${activeCustomer.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      customer: activeCustomer, // Customer identity locked
      projectNumber: formattedNum,
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
      noOfSubscriptions: 5,
      platform: 'Azure Cloud',
      startDate: new Date().toISOString().slice(0, 10),
      goLiveDate: '2026-12-31',
      supportPoc: 'Rachel Adams (Tier 1)',
      sslPem: 'DigiCert Wildcard 2026',
      tam: 'Devon Vance',
    });
    setIsAddProjectModalOpen(true);
  };

  const handleSaveNewProject = (e) => {
    e.preventDefault();
    if (!projectForm) return;

    const newProject = {
      ...projectForm,
      customer: activeCustomer, // ensure strictly bound to this customer
      noOfSubscriptions: Number(projectForm.noOfSubscriptions) || 1,
    };

    const updated = [newProject, ...allProjects];
    setAllProjects(updated);
    saveOnboardingProjects(updated);
    setIsAddProjectModalOpen(false);
    setProjectForm(null);
    showToast(`New project "${newProject.projectNumber}" created for ${activeCustomer}.`);
  };

  const handleOpenEditProject = (project) => {
    setProjectForm({ ...project });
    setIsEditProjectModalOpen(true);
  };

  const handleSaveEditProject = (e) => {
    e.preventDefault();
    if (!projectForm) return;

    const updatedProjects = allProjects.map((p) => {
      if (p.id === projectForm.id) {
        return {
          ...projectForm,
          customer: activeCustomer, // Customer identity locked
          noOfSubscriptions: Number(projectForm.noOfSubscriptions) || 1,
        };
      }
      return p;
    });

    setAllProjects(updatedProjects);
    saveOnboardingProjects(updatedProjects);
    setIsEditProjectModalOpen(false);
    setProjectForm(null);
    showToast(`Project "${projectForm.projectNumber}" updated successfully.`);
  };

  // CSV Export for this customer
  const handleExportCSV = () => {
    const headers = [
      'Customer',
      'Project',
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
      'Subscriptions',
      'Platform',
      'Start Date',
      'Go-live Date',
      'Support POC / Transition',
      'SSL/PEM',
      'TAM',
    ];

    const rows = displayedProjects.map((r) => [
      `"${activeCustomer}"`,
      `"${r.projectNumber || 'Project'}"`,
      `"${r.solution || ''}"`,
      `"${r.type || ''}"`,
      `"${r.status || ''}"`,
      `"${r.transitioned || ''}"`,
      `"${r.implementationTeam || ''}"`,
      `"${r.version || ''}"`,
      `"${r.projectL3 || ''}"`,
      `"${r.location || ''}"`,
      `"${r.secondarySme || ''}"`,
      `"${r.tShirtSize || ''}"`,
      r.noOfSubscriptions,
      `"${r.platform || ''}"`,
      r.startDate,
      r.goLiveDate,
      `"${r.supportPoc || ''}"`,
      `"${r.sslPem || ''}"`,
      `"${r.tam || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `IntelliOnboard_${activeCustomer.replace(/\s+/g, '_')}_Projects.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Active project for the focused view
  const focusedProject = useMemo(() => {
    if (selectedProjectTab !== 'ALL') {
      return customerProjects.find((p) => p.id === selectedProjectTab);
    }
    return customerProjects[0];
  }, [selectedProjectTab, customerProjects]);

  return (
    <div className="w-full min-h-screen bg-[#F5FAFD] pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#004B87] text-white px-5 py-3 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2.5 animate-slide-up border border-[#00b7f1]/30">
          <span className="material-symbols-outlined text-[18px] text-[#00b7f1]">
            check_circle
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="px-6 sm:px-8 py-8 flex flex-col gap-6 max-w-[1680px] mx-auto w-full">
        
        {/* ======================================================= */}
        {/* TOP BAR: NAVIGATION & ACTIONS                            */}
        {/* ======================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e6eeff]">
          <div className="flex items-center gap-3">
            {/* Back action to Customer Onboarding */}
            <button
              type="button"
              onClick={() => onNavigate('customer-onboarding')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#d3e4ff] text-xs font-bold text-[#004B87] hover:bg-[#eff4ff] hover:border-[#004B87] transition-all shadow-xs cursor-pointer group"
            >
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              <span>Back to Customer Onboarding</span>
            </button>

            <span className="text-[#6d7980] text-xs hidden md:inline">/</span>
            <span className="text-xs font-semibold text-[#6d7980] hidden md:inline">
              Single-Customer Scope
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Customer Switcher */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#d3e4ff] shadow-xs">
              <span className="text-[11px] font-bold text-[#6d7980] uppercase">Customer:</span>
              <select
                value={activeCustomer}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#004B87] outline-none cursor-pointer pr-2"
              >
                {customerList.map((cName) => (
                  <option key={cName} value={cName}>
                    {cName}
                  </option>
                ))}
              </select>
            </div>

            {/* View Server Details Button (Direct navigation to Server Details for this customer) */}
            <button
              type="button"
              onClick={() => onNavigate('server-details', { customer: activeCustomer, customerName: activeCustomer })}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004B87] hover:bg-[#003966] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <span>View Server Details</span>
              <span className="material-symbols-outlined text-[16px]">
                open_in_new
              </span>
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* 2. CUSTOMER DETAILS HEADER (CUSTOMER-LEVEL SUMMARY)      */}
        {/* ======================================================= */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,75,135,0.06)] border border-[#d3e4ff] relative overflow-hidden">
          {/* Subtle decorative top brand accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#004B87] via-[#00b7f1] to-[#27609d]" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#006688] bg-[#eff4ff] px-2.5 py-0.5 rounded-md border border-[#d3e4ff]">
                  Customer Details Record
                </span>
                <span className="text-xs text-[#6d7980]">•</span>
                <span className="text-xs text-[#6d7980] font-medium">
                  {customerProjects.length} Onboarding Project{customerProjects.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Exact Header Requirements */}
              <h1 className="text-[28px] sm:text-[32px] font-black text-[#121c2a] tracking-tight leading-tight">
                {activeCustomer}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs">
                {/* Customer Code */}
                <div className="flex items-center gap-2 bg-[#f8fbfe] px-3 py-1.5 rounded-lg border border-[#e6eeff]">
                  <span className="text-[11px] uppercase font-bold text-[#6d7980]">
                    Customer Code:
                  </span>
                  <span className="font-mono font-bold text-[#004B87] text-sm">
                    {customerMeta.customerCode || 'B802'}
                  </span>
                </div>

                {/* JPower ID */}
                <div className="flex items-center gap-2 bg-[#f8fbfe] px-3 py-1.5 rounded-lg border border-[#e6eeff]">
                  <span className="text-[11px] uppercase font-bold text-[#6d7980]">
                    JPower ID:
                  </span>
                  <span className="font-mono font-bold text-[#004B87] text-sm">
                    {customerMeta.jpowerId || '44562'}
                  </span>
                </div>

                {/* Project Status Summary Badge */}
                <div className="flex items-center gap-2 text-[#27609d] bg-[#eff4ff] px-3 py-1.5 rounded-lg border border-[#d3e4ff] font-semibold">
                  <span className="material-symbols-outlined text-[16px] text-[#00b7f1]">
                    donut_large
                  </span>
                  <span>
                    {customerProjects.filter((p) => p.status === 'Completed').length} Completed,{' '}
                    {customerProjects.filter((p) => p.status === 'In Progress').length} In Progress
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Level Edit Action */}
            <div className="flex flex-wrap items-center gap-3">
              {canEdit && (
                <button
                  type="button"
                  onClick={handleOpenEditCustomer}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#f8fbfe] text-[#004B87] border border-[#d3e4ff] text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  <span>Edit Customer Metadata</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#eff4ff] hover:bg-[#dbe7ff] text-[#004B87] border border-[#d3e4ff] text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Customer Ledger</span>
              </button>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* 4 & 5. CUSTOMER PROJECTS SECTION                        */}
        {/* ======================================================= */}
        <div className="flex flex-col gap-4">
          
          {/* Section Header with Add Project Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#004B87]">
                  folder_managed
                </span>
                <h2 className="text-[18px] font-black text-[#121c2a] uppercase tracking-wide">
                  CUSTOMER PROJECTS
                </h2>
              </div>
              <p className="text-xs text-[#6d7980] mt-0.5">
                All onboarding projects belonging to <strong>{activeCustomer}</strong> (1-to-many relationship).
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {canEdit && (
                <button
                  type="button"
                  onClick={handleOpenAddProject}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004B87] to-[#00b7f1] text-white text-xs font-bold shadow-sm hover:brightness-105 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>+ Add Project</span>
                </button>
              )}
            </div>
          </div>

          {/* 7. PROJECT SELECTION PILLS: [ ALL ] [ Project 001 ] [ Project 002 ] ... */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedProjectTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedProjectTab === 'ALL'
                  ? 'bg-[#004B87] text-white shadow-xs'
                  : 'bg-white text-[#121c2a] border border-[#d3e4ff] hover:bg-[#eff4ff]'
              }`}
            >
              All Projects ({customerProjects.length})
            </button>

            {customerProjects.map((p) => {
              const isSelected = selectedProjectTab === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProjectTab(isSelected ? 'ALL' : p.id)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#004B87] text-white shadow-xs ring-2 ring-[#00b7f1]'
                      : 'bg-white text-[#121c2a] border border-[#d3e4ff] hover:bg-[#eff4ff]'
                  }`}
                >
                  <span>{p.projectNumber || 'Project'}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : p.type === 'New Implementation'
                        ? 'bg-[#e0f2fe] text-[#0369a1]'
                        : p.type === 'Upgrade'
                        ? 'bg-[#fef3c7] text-[#92400e]'
                        : 'bg-[#ede9fe] text-[#6d28d9]'
                    }`}
                  >
                    {p.type}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 11. SEARCH & FILTERS TOOLBAR (SCOPED EXCLUSIVELY TO THIS CUSTOMER) */}
          <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-[#e6eeff] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2 text-[#6d7980] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeCustomer}'s projects (Version, L3, SME, Team)...`}
                className="w-full pl-9 pr-8 py-1.5 bg-[#eff4ff] rounded-xl text-xs text-[#121c2a] placeholder:text-[#6d7980] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] border border-[#d3e4ff]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#6d7980] hover:text-[#121c2a] cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] font-semibold text-[#121c2a] outline-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="New Implementation">New Implementation</option>
                <option value="Upgrade">Upgrade</option>
                <option value="J2C">J2C</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-[#eff4ff] rounded-lg border border-[#d3e4ff] font-semibold text-[#121c2a] outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>

              {/* Toggle More Filters Drawer */}
              <button
                type="button"
                onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                  showFiltersDrawer || hasActiveFilters
                    ? 'bg-[#004B87] text-white border-[#004B87]'
                    : 'bg-white text-[#121c2a] border-[#d3e4ff] hover:bg-[#eff4ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Filters</span>
                {hasActiveFilters && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00b7f1]" />
                )}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#004B87] font-bold hover:underline cursor-pointer px-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Extended Filters Drawer */}
          {showFiltersDrawer && (
            <div className="bg-[#f8fbfe] p-4 rounded-2xl border border-[#d3e4ff] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
              {/* Transitioned */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6d7980] mb-1">
                  Transitioned
                </label>
                <select
                  value={filterTransitioned}
                  onChange={(e) => setFilterTransitioned(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#d3e4ff] font-semibold text-[#121c2a] outline-none cursor-pointer"
                >
                  <option value="ALL">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Platform */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6d7980] mb-1">
                  Platform
                </label>
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#d3e4ff] font-semibold text-[#121c2a] outline-none cursor-pointer"
                >
                  <option value="ALL">All Platforms</option>
                  <option value="Azure Cloud">Azure Cloud</option>
                  <option value="BY Cloud">BY Cloud</option>
                  <option value="AWS">AWS</option>
                  <option value="GCP">GCP</option>
                  <option value="On-Premise">On-Premise</option>
                </select>
              </div>

              {/* T-Shirt Size */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6d7980] mb-1">
                  T-Shirt Size
                </label>
                <select
                  value={filterTShirt}
                  onChange={(e) => setFilterTShirt(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#d3e4ff] font-semibold text-[#121c2a] outline-none cursor-pointer"
                >
                  <option value="ALL">All Sizes</option>
                  <option value="Very Small">Very Small</option>
                  <option value="Small">Small</option>
                  <option value="Medium">Medium</option>
                  <option value="Large">Large</option>
                  <option value="Very Large">Very Large</option>
                </select>
              </div>

              {/* Version */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#6d7980] mb-1">
                  Version
                </label>
                <select
                  value={filterVersion}
                  onChange={(e) => setFilterVersion(e.target.value)}
                  className="w-full px-2 py-1.5 bg-white rounded-lg border border-[#d3e4ff] font-semibold text-[#121c2a] outline-none cursor-pointer"
                >
                  <option value="ALL">All Versions</option>
                  {Array.from(new Set(customerProjects.map((p) => p.version))).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full py-1.5 px-3 bg-white border border-[#d3e4ff] text-[#004B87] font-bold rounded-lg hover:bg-[#eff4ff] cursor-pointer text-center"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* 6. EXCEL-STYLE CUSTOMER PROJECTS TABLE                   */}
          {/* ======================================================= */}
          <div className="bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,75,135,0.06)] border border-[#e6eeff] overflow-hidden flex flex-col">
            
            {/* Table Sub-header */}
            <div className="px-5 py-3 bg-[#f8fbfe] border-b border-[#e6eeff] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-[#004B87]">
                  table_view
                </span>
                <span className="font-bold text-[#121c2a]">
                  {activeCustomer} — Project Matrix
                </span>
                <span className="text-[#6d7980]">
                  ({displayedProjects.length} of {customerProjects.length} projects displayed)
                </span>
              </div>

              <div className="text-[11px] text-[#6d7980] flex items-center gap-3">
                <span className="hidden sm:inline">
                  Click any project row to view details or edit.
                </span>
                {!canEdit && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#6d7980] bg-[#eff4ff] px-2 py-0.5 rounded-full border border-[#d3e4ff]">
                    <span className="material-symbols-outlined text-[13px]">visibility</span>
                    Read-Only
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable Spreadsheet Table */}
            <div className="relative overflow-x-auto overflow-y-auto max-h-[560px] border-b border-[#e6eeff]">
              <table className="w-full min-w-[2400px] border-collapse text-left text-xs font-sans">
                
                {/* Sticky Header with Required Columns */}
                {/* Note: Customer Name, Customer Code, and JPower ID are not repeated here as they belong in header */}
                <thead className="sticky top-0 z-20 bg-[#eff4ff] text-[#004B87] shadow-xs">
                  <tr className="border-b border-[#d3e4ff]">
                    {/* Index */}
                    <th className="w-12 px-2.5 py-3 text-center text-[11px] font-mono font-bold text-[#6d7980] border-r border-[#d3e4ff] bg-[#e6eeff] select-none">
                      #
                    </th>

                    {/* Project */}
                    <th
                      onClick={() => handleSort('projectNumber')}
                      className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Project</span>
                        {sortField === 'projectNumber' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Solution */}
                    <th
                      onClick={() => handleSort('solution')}
                      className="w-48 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Solution</span>
                        {sortField === 'solution' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Type */}
                    <th
                      onClick={() => handleSort('type')}
                      className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Type</span>
                        {sortField === 'type' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Status */}
                    <th
                      onClick={() => handleSort('status')}
                      className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        {sortField === 'status' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Transitioned */}
                    <th
                      onClick={() => handleSort('transitioned')}
                      className="w-32 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Transitioned</span>
                        {sortField === 'transitioned' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Implementation Team */}
                    <th
                      onClick={() => handleSort('implementationTeam')}
                      className="w-52 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Implementation Team</span>
                        {sortField === 'implementationTeam' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Version */}
                    <th
                      onClick={() => handleSort('version')}
                      className="w-32 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Version</span>
                        {sortField === 'version' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Project L3 */}
                    <th
                      onClick={() => handleSort('projectL3')}
                      className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Project L3</span>
                        {sortField === 'projectL3' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Location */}
                    <th
                      onClick={() => handleSort('location')}
                      className="w-40 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Location</span>
                        {sortField === 'location' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Secondary SME */}
                    <th
                      onClick={() => handleSort('secondarySme')}
                      className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Secondary SME</span>
                        {sortField === 'secondarySme' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* T-Shirt Size */}
                    <th
                      onClick={() => handleSort('tShirtSize')}
                      className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>T-Shirt Size</span>
                        {sortField === 'tShirtSize' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* No Of Subscriptions */}
                    <th
                      onClick={() => handleSort('noOfSubscriptions')}
                      className="w-32 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Subscriptions</span>
                        {sortField === 'noOfSubscriptions' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Platform */}
                    <th
                      onClick={() => handleSort('platform')}
                      className="w-40 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Platform</span>
                        {sortField === 'platform' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Start Date */}
                    <th
                      onClick={() => handleSort('startDate')}
                      className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Start Date</span>
                        {sortField === 'startDate' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Go-live Date */}
                    <th
                      onClick={() => handleSort('goLiveDate')}
                      className="w-36 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Go-live Date</span>
                        {sortField === 'goLiveDate' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Support POC / Transition */}
                    <th
                      onClick={() => handleSort('supportPoc')}
                      className="w-52 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>Support POC / Trans</span>
                        {sortField === 'supportPoc' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* SSL/PEM */}
                    <th
                      onClick={() => handleSort('sslPem')}
                      className="w-48 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>SSL / PEM</span>
                        {sortField === 'sslPem' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* TAM */}
                    <th
                      onClick={() => handleSort('tam')}
                      className="w-44 px-3.5 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-[#d3e4ff] cursor-pointer hover:bg-[#dbe7ff] transition-colors select-none"
                    >
                      <div className="flex items-center justify-between">
                        <span>TAM</span>
                        {sortField === 'tam' && (
                          <span className="material-symbols-outlined text-[16px]">
                            {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Actions */}
                    <th className="w-24 px-3 py-3 text-center font-bold uppercase tracking-wider text-[11px] select-none">
                      Action
                    </th>
                  </tr>
                </thead>

                {/* Spreadsheet Body */}
                <tbody className="divide-y divide-[#e6eeff]">
                  {displayedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={19} className="py-12 text-center text-[#6d7980]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[32px] text-[#bcc8d0]">
                            folder_off
                          </span>
                          <span className="font-semibold text-sm">
                            No onboarding projects found for {activeCustomer} matching criteria
                          </span>
                          {hasActiveFilters && (
                            <button
                              type="button"
                              onClick={resetFilters}
                              className="mt-2 text-xs text-[#004B87] font-bold hover:underline cursor-pointer"
                            >
                              Reset filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedProjects.map((row, index) => {
                      const isRowSelected = selectedProjectTab === row.id;
                      const isExpanded = expandedProjectId === row.id;

                      return (
                        <React.Fragment key={row.id}>
                          <tr
                            onClick={() => {
                              setSelectedProjectTab(row.id);
                            }}
                            className={`transition-colors cursor-pointer group ${
                              isRowSelected
                                ? 'bg-[#eff8ff]'
                                : 'hover:bg-[#f8fbfe]'
                            }`}
                          >
                            {/* Row Number */}
                            <td className="w-12 px-2.5 py-2 text-center text-[11px] font-mono text-[#6d7980] bg-[#f8fbfe] border-r border-[#e6eeff] select-none group-hover:bg-[#eff4ff]">
                              {index + 1}
                            </td>

                            {/* Project Identifier with Expand Toggle */}
                            <td className="w-36 px-3.5 py-2 border-r border-[#e6eeff] font-bold text-[#004B87]">
                              <div className="flex items-center justify-between">
                                <span>{row.projectNumber || `Project ${index + 1}`}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedProjectId(isExpanded ? null : row.id);
                                  }}
                                  className="w-5 h-5 rounded hover:bg-[#dbe7ff] flex items-center justify-center text-[#6d7980] hover:text-[#004B87] cursor-pointer"
                                  title="Expand full project details"
                                >
                                  <span className="material-symbols-outlined text-[16px]">
                                    {isExpanded ? 'expand_less' : 'expand_more'}
                                  </span>
                                </button>
                              </div>
                            </td>

                            {/* Solution */}
                            <td className="w-48 px-3.5 py-2 border-r border-[#e6eeff] text-[#121c2a]">
                              {row.solution}
                            </td>

                            {/* Type */}
                            <td className="w-44 px-3.5 py-2 border-r border-[#e6eeff]">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                  row.type === 'New Implementation'
                                    ? 'bg-[#e0f2fe] text-[#0369a1]'
                                    : row.type === 'Upgrade'
                                    ? 'bg-[#fef3c7] text-[#92400e]'
                                    : 'bg-[#ede9fe] text-[#6d28d9]'
                                }`}
                              >
                                {row.type}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="w-36 px-3.5 py-2 border-r border-[#e6eeff]">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  row.status === 'Completed'
                                    ? 'bg-[#dcfce7] text-[#15803d]'
                                    : 'bg-[#fef9c3] text-[#a16207]'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    row.status === 'Completed' ? 'bg-[#15803d]' : 'bg-[#a16207]'
                                  }`}
                                />
                                {row.status}
                              </span>
                            </td>

                            {/* Transitioned */}
                            <td className="w-32 px-3.5 py-2 border-r border-[#e6eeff] text-center font-semibold">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  row.transitioned === 'Yes'
                                    ? 'bg-[#f0fdf4] text-[#16a34a]'
                                    : 'bg-[#fef2f2] text-[#dc2626]'
                                }`}
                              >
                                {row.transitioned}
                              </span>
                            </td>

                            {/* Implementation Team */}
                            <td className="w-52 px-3.5 py-2 border-r border-[#e6eeff] text-[#121c2a] font-medium">
                              {row.implementationTeam}
                            </td>

                            {/* Version */}
                            <td className="w-32 px-3.5 py-2 border-r border-[#e6eeff] font-mono text-[#004B87] font-semibold">
                              {row.version}
                            </td>

                            {/* Project L3 */}
                            <td className="w-44 px-3.5 py-2 border-r border-[#e6eeff] text-[#121c2a]">
                              {row.projectL3}
                            </td>

                            {/* Location */}
                            <td className="w-40 px-3.5 py-2 border-r border-[#e6eeff] text-[#121c2a]">
                              {row.location}
                            </td>

                            {/* Secondary SME */}
                            <td className="w-44 px-3.5 py-2 border-r border-[#e6eeff] text-[#121c2a]">
                              {row.secondarySme}
                            </td>

                            {/* T-Shirt Size */}
                            <td className="w-36 px-3.5 py-2 border-r border-[#e6eeff]">
                              <span className="font-semibold text-[#121c2a]">
                                {row.tShirtSize}
                              </span>
                            </td>

                            {/* No Of Subscriptions */}
                            <td className="w-32 px-3.5 py-2 border-r border-[#e6eeff] font-mono font-bold text-center text-[#121c2a]">
                              {row.noOfSubscriptions}
                            </td>

                            {/* Platform */}
                            <td className="w-40 px-3.5 py-2 border-r border-[#e6eeff] font-medium text-[#121c2a]">
                              {row.platform}
                            </td>

                            {/* Start Date */}
                            <td className="w-36 px-3.5 py-2 border-r border-[#e6eeff] font-mono text-[#6d7980]">
                              {row.startDate}
                            </td>

                            {/* Go-live Date */}
                            <td className="w-36 px-3.5 py-2 border-r border-[#e6eeff] font-mono font-semibold text-[#004B87]">
                              {row.goLiveDate}
                            </td>

                            {/* Support POC / Transition */}
                            <td className="w-52 px-3.5 py-2 border-r border-[#e6eeff] text-[#121c2a]">
                              {row.supportPoc}
                            </td>

                            {/* SSL/PEM */}
                            <td className="w-48 px-3.5 py-2 border-r border-[#e6eeff] text-[#6d7980] truncate" title={row.sslPem}>
                              {row.sslPem}
                            </td>

                            {/* TAM */}
                            <td className="w-44 px-3.5 py-2 border-r border-[#e6eeff] text-[#121c2a] font-medium">
                              {row.tam}
                            </td>

                            {/* Actions */}
                            <td className="w-24 px-3 py-2 text-center">
                              {canEdit ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditProject(row);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#eff4ff] hover:bg-[#dbe7ff] text-[#004B87] font-bold text-[11px] cursor-pointer transition-colors"
                                >
                                  Edit
                                </button>
                              ) : (
                                <span className="text-[11px] text-[#6d7980]">—</span>
                              )}
                            </td>
                          </tr>

                          {/* 7. EXPANDABLE ROW DETAILS (All 18 attributes shown cleanly inline) */}
                          {isExpanded && (
                            <tr className="bg-[#f0f7ff]/60 border-b border-[#d3e4ff]">
                              <td colSpan={19} className="p-4 sm:p-6">
                                <div className="bg-white rounded-xl p-5 border border-[#d3e4ff] shadow-xs">
                                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#e6eeff]">
                                    <div className="flex items-center gap-2.5">
                                      <span className="w-2 h-2 rounded-full bg-[#004B87]" />
                                      <h4 className="text-sm font-black text-[#121c2a]">
                                        Detailed Attributes — {row.projectNumber} ({row.type})
                                      </h4>
                                    </div>
                                    {canEdit && (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditProject(row)}
                                        className="text-xs font-bold text-[#004B87] hover:underline flex items-center gap-1 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                        Edit Project
                                      </button>
                                    )}
                                  </div>

                                  {/* Grid of All 18 Attributes */}
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        1. Customer
                                      </span>
                                      <span className="font-bold text-[#121c2a]">{activeCustomer}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        2. Solution
                                      </span>
                                      <span className="font-semibold text-[#121c2a]">{row.solution}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        3. Type
                                      </span>
                                      <span className="font-bold text-[#004B87]">{row.type}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        4. Status
                                      </span>
                                      <span className="font-bold text-[#16a34a]">{row.status}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        5. Transitioned
                                      </span>
                                      <span className="font-bold text-[#121c2a]">{row.transitioned}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        6. Implementation Team
                                      </span>
                                      <span className="font-semibold text-[#121c2a]">{row.implementationTeam}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        7. Version
                                      </span>
                                      <span className="font-mono font-bold text-[#004B87]">{row.version}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        8. Project L3
                                      </span>
                                      <span className="font-semibold text-[#121c2a]">{row.projectL3}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        9. Location
                                      </span>
                                      <span className="font-semibold text-[#121c2a]">{row.location}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        10. Secondary SME
                                      </span>
                                      <span className="font-semibold text-[#121c2a]">{row.secondarySme}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        11. T-Shirt Size
                                      </span>
                                      <span className="font-bold text-[#121c2a]">{row.tShirtSize}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        12. Subscriptions
                                      </span>
                                      <span className="font-mono font-bold text-[#004B87]">{row.noOfSubscriptions}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        13. Platform
                                      </span>
                                      <span className="font-bold text-[#121c2a]">{row.platform}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        14. Start Date
                                      </span>
                                      <span className="font-mono text-[#6d7980]">{row.startDate}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        15. Go-live Date
                                      </span>
                                      <span className="font-mono font-bold text-[#004B87]">{row.goLiveDate}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        16. Support POC
                                      </span>
                                      <span className="font-semibold text-[#121c2a]">{row.supportPoc}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        17. SSL/PEM
                                      </span>
                                      <span className="font-medium text-[#121c2a] truncate">{row.sslPem}</span>
                                    </div>

                                    <div className="bg-[#f8fbfe] p-3 rounded-lg border border-[#e6eeff]">
                                      <span className="text-[10px] font-bold uppercase text-[#6d7980] block mb-0.5">
                                        18. TAM
                                      </span>
                                      <span className="font-bold text-[#004B87]">{row.tam}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ======================================================= */}
          {/* 7. SELECTED PROJECT DETAILED CARD VIEW                   */}
          {/* ======================================================= */}
          {focusedProject && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,75,135,0.06)] border border-[#d3e4ff] flex flex-col gap-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6eeff]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] uppercase font-bold text-[#004B87]">
                      {activeCustomer} • {focusedProject.projectNumber}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00b7f1]" />
                    <span className="text-xs text-[#6d7980] font-mono">
                      Version {focusedProject.version}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#121c2a]">
                    {focusedProject.projectNumber}: {focusedProject.type} Engagement
                  </h3>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                      focusedProject.status === 'Completed'
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : 'bg-[#fef9c3] text-[#a16207]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        focusedProject.status === 'Completed' ? 'bg-[#15803d]' : 'bg-[#a16207]'
                      }`}
                    />
                    Status: {focusedProject.status}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#004B87] border border-[#d3e4ff]">
                    Transitioned: {focusedProject.transitioned}
                  </span>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleOpenEditProject(focusedProject)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#d3e4ff] text-xs font-bold text-[#004B87] hover:bg-[#eff4ff] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      Edit Project
                    </button>
                  )}
                </div>
              </div>

              {/* 4 Thematic Metric Panels covering all 18 Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                {/* Panel 1: Solution & Engagement */}
                <div className="bg-[#f8fbfe] p-4 rounded-xl border border-[#e6eeff] flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7980] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-[#004B87]">
                      category
                    </span>
                    Solution & Engagement
                  </span>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Solution:</span>
                    <span className="font-bold text-[#121c2a]">{focusedProject.solution}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Type:</span>
                    <span className="font-bold text-[#004B87]">{focusedProject.type}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Implementation Team:</span>
                    <span className="font-semibold text-[#121c2a]">{focusedProject.implementationTeam}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6d7980]">Version:</span>
                    <span className="font-mono font-bold text-[#004B87]">{focusedProject.version}</span>
                  </div>
                </div>

                {/* Panel 2: Leadership & SMEs */}
                <div className="bg-[#f8fbfe] p-4 rounded-xl border border-[#e6eeff] flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7980] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-[#004B87]">
                      group
                    </span>
                    Leadership & Technical SMEs
                  </span>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Project L3:</span>
                    <span className="font-bold text-[#121c2a]">{focusedProject.projectL3}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Secondary SME:</span>
                    <span className="font-semibold text-[#121c2a]">{focusedProject.secondarySme}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">TAM:</span>
                    <span className="font-bold text-[#004B87]">{focusedProject.tam}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6d7980]">Support POC:</span>
                    <span className="font-medium text-[#121c2a]">{focusedProject.supportPoc}</span>
                  </div>
                </div>

                {/* Panel 3: Sizing & Infrastructure */}
                <div className="bg-[#f8fbfe] p-4 rounded-xl border border-[#e6eeff] flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7980] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-[#004B87]">
                      cloud
                    </span>
                    Sizing & Platform
                  </span>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Platform:</span>
                    <span className="font-bold text-[#121c2a]">{focusedProject.platform}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">T-Shirt Size:</span>
                    <span className="font-bold text-[#004B87]">{focusedProject.tShirtSize}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">No Of Subscriptions:</span>
                    <span className="font-mono font-bold text-[#121c2a]">{focusedProject.noOfSubscriptions}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6d7980]">Location:</span>
                    <span className="font-semibold text-[#121c2a]">{focusedProject.location}</span>
                  </div>
                </div>

                {/* Panel 4: Timelines & Security */}
                <div className="bg-[#f8fbfe] p-4 rounded-xl border border-[#e6eeff] flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d7980] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px] text-[#004B87]">
                      event
                    </span>
                    Schedule & Certificates
                  </span>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Start Date:</span>
                    <span className="font-mono text-[#121c2a]">{focusedProject.startDate}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#e6eeff]/60">
                    <span className="text-[#6d7980]">Go-live Date:</span>
                    <span className="font-mono font-bold text-[#004B87]">{focusedProject.goLiveDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#6d7980]">SSL/PEM Certificate:</span>
                    <span className="font-medium text-[#121c2a] truncate max-w-[140px]" title={focusedProject.sslPem}>
                      {focusedProject.sslPem}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* BOTTOM ACTIONS BAR: NAVIGATION FOOTER                   */}
          {/* ======================================================= */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-[#e6eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <button
              type="button"
              onClick={() => onNavigate('customer-onboarding')}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#004B87] hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Customer Onboarding</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#6d7980]">
                Need infrastructure details (Citrix, DB, URLs)?
              </span>
              <button
                type="button"
                onClick={() => onNavigate('server-details', { customer: activeCustomer })}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#004B87] hover:bg-[#003966] text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span>View Server Details</span>
                <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 8. EDIT CUSTOMER MODAL (Customer-Level Information Only)  */}
      {/* ========================================================= */}
      {isEditCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#d3e4ff] overflow-hidden">
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#d3e4ff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#004B87]">
                  business
                </span>
                <h3 className="text-sm font-bold text-[#121c2a]">
                  Edit Customer Master Information
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditCustomerModalOpen(false)}
                className="text-[#6d7980] hover:text-[#121c2a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCustomerMeta} className="p-6 flex flex-col gap-4 text-xs">
              <p className="text-[#6d7980] text-[11px]">
                Modifies customer master identity attributes. These apply across all associated onboarding projects.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerEditForm.customerName}
                  onChange={(e) =>
                    setCustomerEditForm({ ...customerEditForm, customerName: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-bold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                  Customer Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerEditForm.customerCode}
                  onChange={(e) =>
                    setCustomerEditForm({ ...customerEditForm, customerCode: e.target.value })
                  }
                  placeholder="e.g. B802"
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] font-mono text-xs font-bold text-[#004B87] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                  JPower ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerEditForm.jpowerId}
                  onChange={(e) =>
                    setCustomerEditForm({ ...customerEditForm, jpowerId: e.target.value })
                  }
                  placeholder="e.g. 44562"
                  className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] font-mono text-xs font-bold text-[#004B87] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e6eeff]">
                <button
                  type="button"
                  onClick={() => setIsEditCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white border border-[#d3e4ff] font-bold text-[#6d7980] hover:bg-[#eff4ff] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#004B87] hover:bg-[#003966] text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Customer Metadata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. ADD / EDIT PROJECT MODAL (Project-Level Only)          */}
      {/* ========================================================= */}
      {(isAddProjectModalOpen || isEditProjectModalOpen) && projectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#d3e4ff] overflow-hidden my-8">
            <div className="px-6 py-4 bg-[#eff4ff] border-b border-[#d3e4ff] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#004B87]">
                  {isAddProjectModalOpen ? 'add_box' : 'edit_document'}
                </span>
                <h3 className="text-sm font-bold text-[#121c2a]">
                  {isAddProjectModalOpen
                    ? `Add New Project for ${activeCustomer}`
                    : `Edit ${projectForm.projectNumber} (${activeCustomer})`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddProjectModalOpen(false);
                  setIsEditProjectModalOpen(false);
                  setProjectForm(null);
                }}
                className="text-[#6d7980] hover:text-[#121c2a] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form
              onSubmit={isAddProjectModalOpen ? handleSaveNewProject : handleSaveEditProject}
              className="p-6 flex flex-col gap-4 text-xs max-h-[75vh] overflow-y-auto"
            >
              {/* Customer Identity Info Notice */}
              <div className="p-3 bg-[#eff8ff] rounded-xl border border-[#d3e4ff] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6d7980] block">Customer</span>
                  <span className="font-black text-sm text-[#004B87]">{activeCustomer}</span>
                </div>
                <div className="text-right text-[11px] text-[#6d7980]">
                  Customer Code: <strong className="font-mono text-[#004B87]">{customerMeta.customerCode}</strong>
                  <br />
                  JPower ID: <strong className="font-mono text-[#004B87]">{customerMeta.jpowerId}</strong>
                </div>
              </div>

              {/* Form Fields: All 18 Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Number */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Project Label / Identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.projectNumber || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, projectNumber: e.target.value })
                    }
                    placeholder="e.g. Project 001"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-bold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Solution */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Solution
                  </label>
                  <select
                    value={projectForm.solution || 'Category Management'}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, solution: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-semibold text-[#121c2a] outline-none cursor-pointer"
                  >
                    <option value="Category Management">Category Management</option>
                    <option value="Assortment & Space Planning">Assortment & Space Planning</option>
                    <option value="Demand & Inventory">Demand & Inventory</option>
                    <option value="Floor Planning">Floor Planning</option>
                    <option value="Enterprise Supply Chain">Enterprise Supply Chain</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Project Type
                  </label>
                  <select
                    value={projectForm.type || 'New Implementation'}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-semibold text-[#121c2a] outline-none cursor-pointer"
                  >
                    <option value="New Implementation">New Implementation</option>
                    <option value="Upgrade">Upgrade</option>
                    <option value="J2C">J2C</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={projectForm.status || 'In Progress'}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, status: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-semibold text-[#121c2a] outline-none cursor-pointer"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Transitioned */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Transitioned
                  </label>
                  <select
                    value={projectForm.transitioned || 'No'}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, transitioned: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-semibold text-[#121c2a] outline-none cursor-pointer"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {/* Implementation Team */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Implementation Team
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.implementationTeam || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, implementationTeam: e.target.value })
                    }
                    placeholder="e.g. Cloud Delivery Pod Alpha"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Version */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.version || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, version: e.target.value })
                    }
                    placeholder="e.g. 2026.1.0"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] font-mono text-xs text-[#004B87] font-bold focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Project L3 */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Project L3
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.projectL3 || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, projectL3: e.target.value })
                    }
                    placeholder="e.g. Alex Vance"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.location || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, location: e.target.value })
                    }
                    placeholder="e.g. Dallas, TX"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Secondary SME */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Secondary SME
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.secondarySme || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, secondarySme: e.target.value })
                    }
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* T-Shirt Size */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    T-Shirt Size
                  </label>
                  <select
                    value={projectForm.tShirtSize || 'Medium'}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, tShirtSize: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-semibold text-[#121c2a] outline-none cursor-pointer"
                  >
                    <option value="Very Small">Very Small</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Very Large">Very Large</option>
                  </select>
                </div>

                {/* No Of Subscriptions */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    No Of Subscriptions
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={projectForm.noOfSubscriptions || 1}
                    onChange={(e) =>
                      setProjectForm({
                        ...projectForm,
                        noOfSubscriptions: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] font-mono text-xs font-bold text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Platform
                  </label>
                  <select
                    value={projectForm.platform || 'Azure Cloud'}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, platform: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs font-semibold text-[#121c2a] outline-none cursor-pointer"
                  >
                    <option value="Azure Cloud">Azure Cloud</option>
                    <option value="BY Cloud">BY Cloud</option>
                    <option value="AWS">AWS</option>
                    <option value="GCP">GCP</option>
                    <option value="On-Premise">On-Premise</option>
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={projectForm.startDate || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] font-mono text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Go-live Date */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Go-live Date
                  </label>
                  <input
                    type="date"
                    required
                    value={projectForm.goLiveDate || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, goLiveDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] font-mono text-xs text-[#004B87] font-bold focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* Support POC / Transition */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    Support POC / Transition
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.supportPoc || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, supportPoc: e.target.value })
                    }
                    placeholder="e.g. Rachel Adams (Tier 1)"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* SSL/PEM */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    SSL / PEM Certificate
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.sslPem || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, sslPem: e.target.value })
                    }
                    placeholder="e.g. DigiCert Wildcard 2026"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs text-[#121c2a] focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                {/* TAM */}
                <div>
                  <label className="block text-[11px] font-bold text-[#121c2a] uppercase mb-1">
                    TAM (Technical Account Manager)
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.tam || ''}
                    onChange={(e) =>
                      setProjectForm({ ...projectForm, tam: e.target.value })
                    }
                    placeholder="e.g. Devon Vance"
                    className="w-full px-3 py-2 rounded-xl bg-[#eff4ff] border border-[#d3e4ff] text-xs text-[#004B87] font-bold focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e6eeff]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddProjectModalOpen(false);
                    setIsEditProjectModalOpen(false);
                    setProjectForm(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-white border border-[#d3e4ff] font-bold text-[#6d7980] hover:bg-[#eff4ff] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#004B87] hover:bg-[#003966] text-white font-bold shadow-xs cursor-pointer"
                >
                  {isAddProjectModalOpen ? 'Add Project' : 'Save Project Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
