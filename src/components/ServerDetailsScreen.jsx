import React, { useState, useMemo, useEffect } from 'react';
import {
  INITIAL_WORKBOOK_CUSTOMERS,
  createBlankCustomerSheet,
} from '../data/customerWorkbookData.js';
import { WorkbookToolbar } from './server-sheet/WorkbookToolbar.jsx';
import { CustomerTechnicalDetailsSheet } from './server-sheet/CustomerTechnicalDetailsSheet.jsx';
import { AddCustomerModal } from './server-sheet/AddCustomerModal.jsx';
import { DeleteCustomerModal } from './server-sheet/DeleteCustomerModal.jsx';
import { exportCustomerSheetToCsv } from './server-sheet/WorkbookExportHelper.js';

export const ServerDetailsScreen = ({
  onNavigate,
  searchQuery: externalSearchQuery = '',
  selectedCustomer: initialCustomerName,
  currentUser,
  onRoleChange,
}) => {
  // ==========================================
  // STATE: Customers & Active Sheet Tab
  // ==========================================
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem('intellionboard_workbook_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Exclude any template sheets
          const nonTemplates = parsed.filter(
            (c) => !c.isTemplate && c.id !== 'sheet-template' && c.name?.toLowerCase() !== 'template'
          );
          // Check if it has modern Customer format (Customer 1 .. 15)
          const hasDemoCustomers = nonTemplates.some((c) => c.name?.startsWith('Customer '));
          if (hasDemoCustomers && nonTemplates.length > 0) {
            return nonTemplates;
          }
        }
      }
    } catch {}
    return INITIAL_WORKBOOK_CUSTOMERS.filter(
      (c) => !c.isTemplate && c.id !== 'sheet-template' && c.name?.toLowerCase() !== 'template'
    );
  });

  // Default active tab to Customer 1 (or matched initialCustomerName)
  const [activeCustomerId, setActiveCustomerId] = useState(() => {
    const validCustomers = INITIAL_WORKBOOK_CUSTOMERS.filter(
      (c) => !c.isTemplate && c.id !== 'sheet-template' && c.name?.toLowerCase() !== 'template'
    );
    if (initialCustomerName) {
      const matched = validCustomers.find(
        (c) => c.name.toLowerCase() === initialCustomerName.toLowerCase()
      );
      if (matched) return matched.id;
    }
    const customer1 = validCustomers.find((c) => c.name === 'Customer 1');
    return customer1 ? customer1.id : validCustomers[0]?.id || 'sheet-customer-1';
  });

  // Save to localStorage when customers state changes
  const saveWorkbookToStorage = (updatedCustomers) => {
    try {
      localStorage.setItem(
        'intellionboard_workbook_customers',
        JSON.stringify(updatedCustomers)
      );
    } catch {}
  };

  // ==========================================
  // STATE: Search & Filter
  // ==========================================
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');

  // Keep search query synced with external search if changed
  useEffect(() => {
    if (externalSearchQuery) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Sync active customer when initialCustomerName changes
  useEffect(() => {
    if (initialCustomerName && customers.length > 0) {
      const matched = customers.find(
        (c) => c.name?.toLowerCase() === initialCustomerName.toLowerCase()
      );
      if (matched) {
        setActiveCustomerId(matched.id);
      }
    }
  }, [initialCustomerName, customers]);

  // ==========================================
  // STATE: Zoom & Display
  // ==========================================
  const [zoom, setZoom] = useState(100);

  // ==========================================
  // STATE: Modals
  // ==========================================
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [saveNotification, setSaveNotification] = useState(null);

  // ==========================================
  // STATE: RBAC Role-Based Access Control
  // ==========================================
  const mapStandardToInternalRole = (stdRole) => {
    if (stdRole === 'Admin User') return 'ADMIN';
    if (stdRole === 'Power User') return 'POWER_USER';
    if (stdRole === 'SME User') return 'SME_USER';
    if (stdRole === 'Edit Sheet User') return 'EDIT_SHEET_USER';
    if (stdRole === 'Read-only User' || stdRole === 'Read-Only User') return 'READ_ONLY';
    if (stdRole === 'No Role') return 'NO_ROLE';
    return 'ADMIN';
  };

  const [currentRole, setCurrentRole] = useState(() =>
    mapStandardToInternalRole(currentUser?.role || 'Admin User')
  );
  const currentSmeName = currentUser?.name || 'Alex Vance';

  useEffect(() => {
    if (currentUser?.role) {
      setCurrentRole(mapStandardToInternalRole(currentUser.role));
    }
  }, [currentUser?.role]);

  // Active customer sheet
  const activeCustomer = useMemo(() => {
    return customers.find((c) => c.id === activeCustomerId) || customers[0];
  }, [customers, activeCustomerId]);

  // Role permissions
  const hasAccess = currentRole !== 'NO_ROLE';
  const isReadOnly = currentRole === 'READ_ONLY';
  const canAddCustomer = ['ADMIN', 'POWER_USER', 'EDIT_SHEET_USER'].includes(currentRole);

  const canEdit = useMemo(() => {
    if (isReadOnly || currentRole === 'NO_ROLE') return false;
    if (['ADMIN', 'POWER_USER', 'EDIT_SHEET_USER'].includes(currentRole)) return true;
    if (currentRole === 'SME_USER') {
      const assigned = currentUser?.assignedCustomers || ['Customer 1', 'Customer 2', 'Customer 3'];
      if (assigned.includes('All Customers')) return true;
      if (assigned.includes(activeCustomer?.name)) return true;
      return (
        activeCustomer.metadata?.primarySme === currentSmeName ||
        activeCustomer.metadata?.secondarySme === currentSmeName
      );
    }
    return false;
  }, [currentRole, isReadOnly, activeCustomer, currentSmeName, currentUser]);

  // ==========================================
  // STATE: Pending Changes Tracking (Unsaved cell edits)
  // ==========================================
  const [pendingChanges, setPendingChanges] = useState({});
  const pendingChangesCount = Object.keys(pendingChanges).length;

  // Track modified metadata
  const handleUpdateMetadata = (customerId, field, value) => {
    if (!canEdit) return;

    setCustomers((prev) => {
      const updated = prev.map((cust) => {
        if (cust.id === customerId) {
          return {
            ...cust,
            metadata: {
              ...cust.metadata,
              [field]: value,
            },
          };
        }
        return cust;
      });
      return updated;
    });

    const keyPath = `${customerId}:meta:${field}`;
    setPendingChanges((prev) => ({
      ...prev,
      [keyPath]: { field, value, timestamp: Date.now() },
    }));
  };

  // Track modified environment value
  const handleUpdateEnvironmentValue = (customerId, envKey, field, value) => {
    if (!canEdit) return;

    setCustomers((prev) => {
      const updated = prev.map((cust) => {
        if (cust.id === customerId) {
          return {
            ...cust,
            environments: {
              ...cust.environments,
              [envKey]: {
                ...cust.environments[envKey],
                [field]: value,
              },
            },
          };
        }
        return cust;
      });
      return updated;
    });

    const keyPath = `${customerId}:${envKey}:${field}`;
    setPendingChanges((prev) => ({
      ...prev,
      [keyPath]: { envKey, field, value, timestamp: Date.now() },
    }));
  };

  // Track modified environment version (independent per environment)
  const handleUpdateEnvironmentVersion = (customerId, envKey, version) => {
    if (!canEdit) return;

    setCustomers((prev) => {
      const updated = prev.map((cust) => {
        if (cust.id === customerId) {
          return {
            ...cust,
            environments: {
              ...cust.environments,
              [envKey]: {
                ...cust.environments[envKey],
                version,
              },
            },
          };
        }
        return cust;
      });
      return updated;
    });

    const keyPath = `${customerId}:${envKey}:version`;
    setPendingChanges((prev) => ({
      ...prev,
      [keyPath]: { envKey, field: 'version', value: version, timestamp: Date.now() },
    }));
  };

  // Add application row
  const handleAddApplication = (customerId, categoryKey) => {
    if (!canEdit) return;

    const appName = window.prompt(
      `Enter application name to install under ${categoryKey}:`,
      'New Enterprise Application'
    );
    if (!appName || !appName.trim()) return;

    setCustomers((prev) => {
      const updated = prev.map((cust) => {
        if (cust.id === customerId) {
          const currentList = cust.applications?.[categoryKey] || [];
          return {
            ...cust,
            applications: {
              ...cust.applications,
              [categoryKey]: [...currentList, appName.trim()],
            },
          };
        }
        return cust;
      });
      saveWorkbookToStorage(updated);
      return updated;
    });

    setSaveNotification({
      type: 'success',
      message: `Added "${appName.trim()}" to ${activeCustomer.name}`,
    });
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // Delete application row
  const handleDeleteApplication = (customerId, categoryKey, index) => {
    if (!canEdit) return;

    setCustomers((prev) => {
      const updated = prev.map((cust) => {
        if (cust.id === customerId) {
          const currentList = cust.applications?.[categoryKey] || [];
          const updatedList = currentList.filter((_, i) => i !== index);
          return {
            ...cust,
            applications: {
              ...cust.applications,
              [categoryKey]: updatedList,
            },
          };
        }
        return cust;
      });
      saveWorkbookToStorage(updated);
      return updated;
    });
  };

  // Create new customer worksheet using standard template
  const handleCreateCustomer = (formData) => {
    const newSheet = createBlankCustomerSheet(formData);

    setCustomers((prev) => {
      const updated = [...prev, newSheet];
      saveWorkbookToStorage(updated);
      return updated;
    });

    // Immediately select the new customer tab
    setActiveCustomerId(newSheet.id);

    setSaveNotification({
      type: 'success',
      message: `Created new worksheet for ${newSheet.name} with blank DEV, TEST, and PROD configurations.`,
    });
    setTimeout(() => setSaveNotification(null), 4000);
  };

  // Save changes
  const handleSaveChanges = () => {
    saveWorkbookToStorage(customers);
    const count = pendingChangesCount;
    setPendingChanges({});
    setSaveNotification({
      type: 'success',
      message: `Successfully saved ${count} modification${count > 1 ? 's' : ''} to customer sheet.`,
    });
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (window.confirm('Discard all unsaved modifications? This will reload the baseline saved values.')) {
      try {
        const saved = localStorage.getItem('intellionboard_workbook_customers');
        if (saved) {
          setCustomers(JSON.parse(saved));
        } else {
          setCustomers(INITIAL_WORKBOOK_CUSTOMERS);
        }
      } catch {
        setCustomers(INITIAL_WORKBOOK_CUSTOMERS);
      }
      setPendingChanges({});
    }
  };

  // Delete customer sheet with confirmation
  const handleRequestDeleteCustomer = (customer) => {
    if (customers.length <= 1) {
      setSaveNotification({
        type: 'warning',
        message: 'Cannot delete the only remaining customer sheet. At least one customer sheet is required.',
      });
      setTimeout(() => setSaveNotification(null), 4000);
      return;
    }
    setCustomerToDelete(customer);
  };

  const handleConfirmDeleteCustomer = (customerId) => {
    const targetCustomer = customers.find((c) => c.id === customerId);
    const updated = customers.filter((c) => c.id !== customerId);
    setCustomers(updated);
    saveWorkbookToStorage(updated);

    // If deleting the active customer, switch to the first customer in the new list
    if (activeCustomerId === customerId && updated.length > 0) {
      setActiveCustomerId(updated[0].id);
    }

    setCustomerToDelete(null);
    setSaveNotification({
      type: 'success',
      message: `Customer sheet "${targetCustomer?.name || 'Customer'}" was deleted successfully.`,
    });
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // Export current customer sheet to CSV
  const handleExportWorkbook = () => {
    exportCustomerSheetToCsv(activeCustomer);
  };

  // Access restriction screen for NO_ROLE
  if (!hasAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md border border-[#CBD5E1] text-center">
          <span className="material-symbols-outlined text-[48px] text-red-500 mb-2">
            lock_person
          </span>
          <h2 className="text-lg font-bold text-[#1E293B] mb-1">Access Restricted</h2>
          <p className="text-xs text-[#64748B] mb-4">
            Your current role has no permissions to view or edit the Server Details Workbook.
            Please switch to an authorized role using the selector below.
          </p>
          <div className="flex items-center justify-center gap-2">
            <label className="text-xs font-semibold text-[#475569]">Switch Role:</label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              className="h-8 px-2 text-xs font-semibold text-[#004B87] bg-[#F1F5F9] border border-[#CBD5E1] rounded cursor-pointer"
            >
              <option value="ADMIN">Admin User</option>
              <option value="POWER_USER">Power User</option>
              <option value="SME_USER">SME User (Alex Vance)</option>
              <option value="EDIT_SHEET_USER">Edit Sheet User</option>
              <option value="READ_ONLY">Read-Only User</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-72px)] overflow-hidden bg-[#F1F5F9]">
      {/* Toast Notification */}
      {saveNotification && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#0F172A] text-white text-xs font-medium rounded-lg shadow-xl border border-slate-700 animate-in slide-in-from-top-2 duration-200">
          <span className="material-symbols-outlined text-emerald-400 text-[18px]">
            check_circle
          </span>
          <span>{saveNotification.message}</span>
          <button
            onClick={() => setSaveNotification(null)}
            className="text-slate-400 hover:text-white ml-2 p-0.5"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Top Excel Ribbon Toolbar */}
      <WorkbookToolbar
        customers={customers}
        activeCustomerId={activeCustomerId}
        onSelectCustomer={setActiveCustomerId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        pendingChangesCount={pendingChangesCount}
        onSaveChanges={handleSaveChanges}
        onDiscardChanges={handleDiscardChanges}
        onAddCustomerClick={() => setIsAddCustomerModalOpen(true)}
        onExportWorkbook={handleExportWorkbook}
        canEdit={canEdit}
        canAddCustomer={canAddCustomer}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* Primary Excel Worksheet Canvas */}
      <CustomerTechnicalDetailsSheet
        customerSheet={activeCustomer}
        customers={customers}
        activeCustomerId={activeCustomerId}
        onSelectCustomer={setActiveCustomerId}
        onAddCustomerClick={() => setIsAddCustomerModalOpen(true)}
        onRequestDeleteCustomer={handleRequestDeleteCustomer}
        onUpdateMetadata={handleUpdateMetadata}
        onUpdateEnvironmentValue={handleUpdateEnvironmentValue}
        onUpdateEnvironmentVersion={handleUpdateEnvironmentVersion}
        onAddApplication={handleAddApplication}
        onUpdateApplication={() => {}}
        onDeleteApplication={handleDeleteApplication}
        pendingChanges={pendingChanges}
        canEdit={canEdit}
        zoom={zoom}
      />

      {/* Add Customer Modal Dialog */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onCreateCustomer={handleCreateCustomer}
      />

      {/* Delete Customer Sheet Confirmation Modal */}
      <DeleteCustomerModal
        isOpen={Boolean(customerToDelete)}
        customer={customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirmDelete={handleConfirmDeleteCustomer}
      />
    </div>
  );
};
