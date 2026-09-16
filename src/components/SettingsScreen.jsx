import React, { useState, useMemo } from 'react';
import {
  ROLES,
  ROLE_DETAILS,
  APP_AREAS,
  PERMISSION_TYPES,
  PERMISSION_MATRIX,
  loadUsers,
  saveUsers,
  loadActiveUser,
  saveActiveUser,
} from '../data/userRoleStore.js';

export const SettingsScreen = ({ onNavigate, currentUser, onUserChange }) => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'roles'
  const [users, setUsers] = useState(() => loadUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Add / Edit User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingUserId, setEditingUserId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'SME User',
    assignedCustomers: ['Customer 1'],
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Quick Change Role Modal
  const [changeRoleUser, setChangeRoleUser] = useState(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Demo Customers list (1 to 15)
  const DEMO_CUSTOMERS = useMemo(
    () => Array.from({ length: 15 }, (_, i) => `Customer ${i + 1}`),
    []
  );

  // Filtered Users list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingUserId(null);
    setFormData({
      name: '',
      email: '',
      role: 'SME User',
      assignedCustomers: ['Customer 1'],
      status: 'Active',
    });
    setFormErrors({});
    setIsUserModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (user) => {
    setModalMode('edit');
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCustomers: Array.isArray(user.assignedCustomers) ? [...user.assignedCustomers] : ['Customer 1'],
      status: user.status,
    });
    setFormErrors({});
    setIsUserModalOpen(true);
  };

  // Toggle Customer selection for SME or general user
  const handleToggleCustomer = (cust) => {
    setFormData((prev) => {
      const current = prev.assignedCustomers || [];
      if (current.includes(cust)) {
        return {
          ...prev,
          assignedCustomers: current.filter((c) => c !== cust),
        };
      } else {
        return {
          ...prev,
          assignedCustomers: [...current, cust],
        };
      }
    });
  };

  // Select all or clear all customers in modal
  const handleSelectAllCustomers = () => {
    setFormData((prev) => ({
      ...prev,
      assignedCustomers: [...DEMO_CUSTOMERS],
    }));
  };

  const handleClearAllCustomers = () => {
    setFormData((prev) => ({
      ...prev,
      assignedCustomers: [],
    }));
  };

  // Submit User Form (Add or Edit)
  const handleSaveUserForm = (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = 'User Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.role === 'SME User' && (!formData.assignedCustomers || formData.assignedCustomers.length === 0)) {
      errors.assignedCustomers = 'SME Users must be assigned to at least one customer';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    let updatedList;
    if (modalMode === 'add') {
      const newUser = {
        id: `usr-${Date.now()}`,
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        assignedCustomers:
          formData.role === 'Admin User' || formData.role === 'Power User'
            ? ['All Customers']
            : formData.assignedCustomers,
        status: formData.status,
      };
      updatedList = [newUser, ...users];
      showToast(`User "${newUser.name}" created successfully.`);
    } else {
      updatedList = users.map((u) => {
        if (u.id === editingUserId) {
          const updated = {
            ...u,
            name: formData.name.trim(),
            email: formData.email.trim(),
            role: formData.role,
            assignedCustomers:
              formData.role === 'Admin User' || formData.role === 'Power User'
                ? ['All Customers']
                : formData.assignedCustomers,
            status: formData.status,
          };
          if (currentUser && currentUser.id === u.id && onUserChange) {
            onUserChange(updated);
          }
          return updated;
        }
        return u;
      });
      showToast('User record updated successfully.');
    }

    setUsers(updatedList);
    saveUsers(updatedList);
    setIsUserModalOpen(false);
  };

  // Activate / Deactivate Toggle
  const handleToggleStatus = (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    const updated = users.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u));
    setUsers(updated);
    saveUsers(updated);

    if (currentUser && currentUser.id === user.id && onUserChange) {
      onUserChange({ ...currentUser, status: nextStatus });
    }

    showToast(`User ${user.name} is now ${nextStatus}.`);
  };

  // Direct Change Role
  const handleConfirmChangeRole = (newRole) => {
    if (!changeRoleUser) return;
    const updated = users.map((u) => {
      if (u.id === changeRoleUser.id) {
        return {
          ...u,
          role: newRole,
          assignedCustomers:
            newRole === 'Admin User' || newRole === 'Power User'
              ? ['All Customers']
              : u.assignedCustomers.length > 0
              ? u.assignedCustomers
              : ['Customer 1'],
        };
      }
      return u;
    });

    setUsers(updated);
    saveUsers(updated);

    if (currentUser && currentUser.id === changeRoleUser.id && onUserChange) {
      const active = updated.find((u) => u.id === changeRoleUser.id);
      if (active) onUserChange(active);
    }

    showToast(`Role for ${changeRoleUser.name} updated to ${newRole}.`);
    setChangeRoleUser(null);
  };

  return (
    <div className="w-full min-h-screen bg-[#F5FAFD] pb-24">
      <div className="px-6 sm:px-8 py-8 flex flex-col gap-6 max-w-[1240px] mx-auto w-full">
        {/* Page Header */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl shadow-sm border border-[#e6eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] uppercase tracking-wider text-[#004B87] font-bold">
                Access Governance
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00b7f1]"></span>
              <span className="text-xs text-[#6d7980]">User & Permission Management</span>
            </div>
            <h1 className="text-[26px] text-[#121c2a] font-bold tracking-tight">
              Settings & Administration
            </h1>
            <p className="text-xs sm:text-sm text-[#3d484f] mt-0.5 max-w-2xl leading-relaxed">
              Manage IntelliOnboard users, roles and access permissions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl bg-[#eff4ff] text-[#004B87] hover:bg-[#e6eeff] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-[#d3e4ff]"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Dashboard
            </button>
          </div>
        </div>

        {/* Primary Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-[#d8e5f7] pb-1 gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#004B87] text-white shadow-sm'
                  : 'text-[#3d484f] hover:text-[#004B87] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Users</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'users' ? 'bg-white/20 text-white' : 'bg-[#e2edfa] text-[#004B87]'
                }`}
              >
                {users.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-[#004B87] text-white shadow-sm'
                  : 'text-[#3d484f] hover:text-[#004B87] hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">security</span>
              <span>Roles & Permissions</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'roles' ? 'bg-white/20 text-white' : 'bg-[#e2edfa] text-[#004B87]'
                }`}
              >
                {ROLES.length} Roles
              </span>
            </button>
          </div>

          {activeTab === 'users' && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004B87] to-[#00b7f1] hover:from-[#003966] hover:to-[#009ed4] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">person_add</span>
              <span>+ Add New User</span>
            </button>
          )}
        </div>

        {/* ============================================================
            TAB 1: USERS
        ============================================================ */}
        {activeTab === 'users' && (
          <div className="flex flex-col gap-5">
            {/* Header & Description */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#e6eeff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-[18px] text-[#121c2a] font-bold">User Management</h2>
                <p className="text-xs text-[#6d7980] mt-0.5">
                  Manage IntelliOnboard users and their access levels.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px]">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#6d7980] text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-3 py-2 bg-[#eff4ff] border border-[#d8e5f7] rounded-xl text-xs text-[#121c2a] placeholder:text-[#6d7980] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 bg-[#eff4ff] border border-[#d8e5f7] rounded-xl text-xs text-[#121c2a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                >
                  <option value="ALL">All Roles</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#eff4ff] border border-[#d8e5f7] rounded-xl text-xs text-[#121c2a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e6eeff] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fbfe] border-b border-[#e6eeff] text-[11px] font-bold text-[#6d7980] uppercase tracking-wider">
                      <th className="py-3.5 px-5">User</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4">Role</th>
                      <th className="py-3.5 px-4">Assigned Customers</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef4fc] text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#6d7980]">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[32px] text-[#004B87]/40">
                              person_off
                            </span>
                            <p className="font-semibold text-sm text-[#121c2a]">No users found</p>
                            <p className="text-xs text-[#6d7980]">Try adjusting your search query or filters.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => {
                        const roleInfo = ROLE_DETAILS[user.role] || ROLE_DETAILS['No Role'];
                        const initials = user.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase();

                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-[#f8fbfe] transition-colors group"
                          >
                            {/* User Name & Avatar */}
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#004B87] to-[#00b7f1] text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-xs">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-bold text-[#121c2a] text-xs flex items-center gap-2">
                                    <span>{user.name}</span>
                                    {currentUser && currentUser.id === user.id && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#dcfce7] text-[#15803d] font-bold">
                                        You
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Email */}
                            <td className="py-3.5 px-4 text-[#3d484f] font-mono text-[11px]">
                              {user.email}
                            </td>

                            {/* Role */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border ${roleInfo.badgeClass}`}
                              >
                                {user.role}
                              </span>
                            </td>

                            {/* Assigned Customers */}
                            <td className="py-3.5 px-4">
                              {user.role === 'Admin User' || user.role === 'Power User' ? (
                                <span className="text-[11px] text-[#004B87] font-semibold bg-[#eff4ff] px-2.5 py-0.5 rounded-md border border-[#d3e4ff]">
                                  All Customers (Global)
                                </span>
                              ) : user.role === 'No Role' ? (
                                <span className="text-[11px] text-[#94a3b8] italic">None</span>
                              ) : Array.isArray(user.assignedCustomers) && user.assignedCustomers.length > 0 ? (
                                <div className="flex flex-wrap items-center gap-1 max-w-[280px]">
                                  {user.assignedCustomers.slice(0, 3).map((c) => (
                                    <span
                                      key={c}
                                      className="px-2 py-0.5 rounded bg-[#eff4ff] border border-[#d8e5f7] text-[10px] font-semibold text-[#004B87]"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                  {user.assignedCustomers.length > 3 && (
                                    <span
                                      className="px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[10px] text-[#475569] font-bold"
                                      title={user.assignedCustomers.slice(3).join(', ')}
                                    >
                                      +{user.assignedCustomers.length - 3} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] text-[#b91c1c] font-medium">Unassigned</span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                  user.status === 'Active'
                                    ? 'bg-[#dcfce7] text-[#15803d]'
                                    : 'bg-[#f1f5f9] text-[#64748b]'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    user.status === 'Active' ? 'bg-[#22c55e]' : 'bg-[#94a3b8]'
                                  }`}
                                />
                                {user.status}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(user)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#004B87] hover:bg-[#eff4ff] border border-[#d8e5f7] transition-colors cursor-pointer"
                                  title="Edit user details"
                                >
                                  Edit
                                </button>

                                {/* Change Role */}
                                <button
                                  type="button"
                                  onClick={() => setChangeRoleUser(user)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#27609d] hover:bg-[#eff4ff] border border-[#d8e5f7] transition-colors cursor-pointer"
                                  title="Change assigned role"
                                >
                                  Change Role
                                </button>

                                {/* Activate / Deactivate */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(user)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                    user.status === 'Active'
                                      ? 'text-[#b91c1c] hover:bg-[#fef2f2] border-[#fecaca]'
                                      : 'text-[#15803d] hover:bg-[#f0fdf4] border-[#bbf7d0]'
                                  }`}
                                  title={user.status === 'Active' ? 'Deactivate account' : 'Activate account'}
                                >
                                  {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 2: ROLES & PERMISSIONS
        ============================================================ */}
        {activeTab === 'roles' && (
          <div className="flex flex-col gap-6">
            {/* Overview Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#e6eeff]">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-[#004B87] text-[20px]">
                  verified_user
                </span>
                <h2 className="text-[19px] text-[#121c2a] font-bold">
                  IntelliOnboard Role Matrix & Access Policies
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#3d484f] max-w-3xl leading-relaxed">
                Granular permission matrix regulating navigation access, editing authority, and administrative capabilities across all application modules.
              </p>
            </div>

            {/* Role Definitions Cards (Behavioral breakdown) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ROLES.map((roleKey) => {
                const detail = ROLE_DETAILS[roleKey];
                return (
                  <div
                    key={roleKey}
                    className="bg-white rounded-2xl p-5 border border-[#e6eeff] shadow-xs flex flex-col justify-between hover:border-[#c2daf8] transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <h3 className="font-bold text-sm text-[#121c2a]">{detail.title}</h3>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${detail.badgeClass}`}
                        >
                          {roleKey === 'No Role' ? 'Access Blocked' : 'Active Role'}
                        </span>
                      </div>
                      <p className="text-xs text-[#3d484f] leading-relaxed mb-3">
                        {detail.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#f0f4fa] text-[11px] text-[#6d7980] flex flex-wrap gap-2">
                      {detail.canManageUsers && (
                        <span className="px-2 py-0.5 rounded bg-[#eff6ff] text-[#1d4ed8] font-bold">
                          Manage Users
                        </span>
                      )}
                      {detail.canCreateOB && (
                        <span className="px-2 py-0.5 rounded bg-[#f0fdf4] text-[#15803d] font-bold">
                          Create Onboarding
                        </span>
                      )}
                      {detail.canEditAssignedOnly && (
                        <span className="px-2 py-0.5 rounded bg-[#faf5ff] text-[#7e22ce] font-bold">
                          Assigned Customers Only
                        </span>
                      )}
                      {detail.isReadOnly && roleKey !== 'No Role' && (
                        <span className="px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] font-bold">
                          Read-Only Access
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Permission Matrix Grid */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#e6eeff] overflow-hidden">
              <div className="p-5 border-b border-[#e6eeff] bg-[#fbfdff] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-[16px] text-[#121c2a]">
                    Application Area Permission Matrix
                  </h3>
                  <p className="text-xs text-[#6d7980]">
                    Permissions assigned to each role across application modules.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="text-[#6d7980] font-semibold">Permission Types:</span>
                  {PERMISSION_TYPES.map((pt) => (
                    <span
                      key={pt}
                      className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#004B87] font-bold border border-[#d3e4ff]"
                    >
                      {pt}
                    </span>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fbfe] border-b border-[#e6eeff] text-[11px] font-bold text-[#6d7980] uppercase tracking-wider">
                      <th className="py-3 px-5 min-w-[180px]">Application Area</th>
                      {ROLES.map((role) => (
                        <th key={role} className="py-3 px-3 min-w-[140px] text-center">
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef4fc] text-xs">
                    {APP_AREAS.map((area) => {
                      return (
                        <tr key={area} className="hover:bg-[#f8fbfe]/80 transition-colors">
                          <td className="py-3 px-5 font-bold text-[#121c2a]">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#004B87]/40"></span>
                              <span>{area}</span>
                            </div>
                          </td>

                          {ROLES.map((role) => {
                            const perms = PERMISSION_MATRIX[area]?.[role] || [];
                            const hasNone = perms.length === 0;

                            return (
                              <td key={role} className="py-3 px-3 text-center">
                                {hasNone ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f8fafc] text-[#cbd5e1] font-bold text-xs select-none">
                                    —
                                  </span>
                                ) : (
                                  <div className="flex flex-wrap items-center justify-center gap-1">
                                    {perms.map((p) => {
                                      let pillClass = 'bg-[#eff4ff] text-[#004B87] border-[#d3e4ff]';
                                      if (p === 'Manage Users') pillClass = 'bg-[#fdf2f8] text-[#be185d] border-[#fbcfe8]';
                                      if (p === 'Create') pillClass = 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]';
                                      if (p === 'Edit') pillClass = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
                                      return (
                                        <span
                                          key={p}
                                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${pillClass}`}
                                        >
                                          {p}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: ADD / EDIT USER
        ============================================================ */}
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#e6eeff] w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-6 py-5 border-b border-[#e6eeff] flex items-center justify-between bg-[#f8fbfe]">
                <div>
                  <h3 className="font-bold text-base text-[#121c2a]">
                    {modalMode === 'add' ? 'Add New User' : 'Edit User'}
                  </h3>
                  <p className="text-xs text-[#6d7980]">
                    {modalMode === 'add'
                      ? 'Create a new IntelliOnboard enterprise user profile.'
                      : 'Update user account access and permissions.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="w-8 h-8 rounded-lg text-[#6d7980] hover:text-[#121c2a] hover:bg-[#eff4ff] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveUserForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* User Name */}
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">
                    User Name <span className="text-[#b91c1c]">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rachel Adams"
                    className="w-full px-3.5 py-2.5 bg-[#eff4ff] border border-[#d8e5f7] rounded-xl text-xs text-[#121c2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                  {formErrors.name && (
                    <p className="text-[11px] text-[#b91c1c] mt-1">{formErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">
                    Email <span className="text-[#b91c1c]">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rachel.adams@blueyonder.com"
                    className="w-full px-3.5 py-2.5 bg-[#eff4ff] border border-[#d8e5f7] rounded-xl text-xs text-[#121c2a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-[#b91c1c] mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">
                    Role <span className="text-[#b91c1c]">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#eff4ff] border border-[#d8e5f7] rounded-xl text-xs text-[#121c2a] font-semibold focus:outline-none focus:ring-2 focus:ring-[#00b7f1]"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#6d7980] mt-1">
                    {ROLE_DETAILS[formData.role]?.description}
                  </p>
                </div>

                {/* Assigned Customers (Crucial for SME User) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#121c2a]">
                      Assigned Customers
                      {formData.role === 'SME User' && (
                        <span className="text-[#b91c1c] ml-1">* (Required for SME User)</span>
                      )}
                    </label>

                    {formData.role === 'SME User' && (
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={handleSelectAllCustomers}
                          className="text-[#004B87] hover:underline font-semibold cursor-pointer"
                        >
                          Select All
                        </button>
                        <span className="text-[#cbd5e1]">|</span>
                        <button
                          type="button"
                          onClick={handleClearAllCustomers}
                          className="text-[#6d7980] hover:underline font-semibold cursor-pointer"
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  {formData.role === 'Admin User' || formData.role === 'Power User' ? (
                    <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#d8e5f7] text-xs text-[#004B87] font-medium">
                      Admin and Power Users have global access to all customers automatically.
                    </div>
                  ) : formData.role === 'No Role' ? (
                    <div className="p-3 rounded-xl bg-[#fef2f2] border border-[#fecaca] text-xs text-[#b91c1c]">
                      No customers can be assigned while user has No Role.
                    </div>
                  ) : (
                    <div className="border border-[#d8e5f7] rounded-xl p-3 bg-[#f8fbfe] max-h-44 overflow-y-auto space-y-1.5">
                      <p className="text-[11px] text-[#6d7980] mb-2 font-medium">
                        Select which demo customers this user is permitted to manage and edit:
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {DEMO_CUSTOMERS.map((cust) => {
                          const isChecked = formData.assignedCustomers?.includes(cust);
                          return (
                            <label
                              key={cust}
                              className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                                isChecked
                                  ? 'bg-[#eff4ff] border-[#00b7f1] text-[#004B87] font-bold'
                                  : 'bg-white border-[#e2e8f0] text-[#3d484f] hover:bg-[#f1f5f9]'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCustomer(cust)}
                                className="w-3.5 h-3.5 accent-[#004B87]"
                              />
                              <span>{cust}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formErrors.assignedCustomers && (
                    <p className="text-[11px] text-[#b91c1c] mt-1">
                      {formErrors.assignedCustomers}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-bold text-[#121c2a] mb-1">Status</label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#121c2a] cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={formData.status === 'Active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="accent-[#004B87]"
                      />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]"></span>
                        Active
                      </span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-semibold text-[#121c2a] cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={formData.status === 'Inactive'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="accent-[#004B87]"
                      />
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#94a3b8]"></span>
                        Inactive
                      </span>
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-[#e6eeff] flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6d7980] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#004B87] to-[#00b7f1] hover:from-[#003966] hover:to-[#009ed4] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    {modalMode === 'add' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================
            MODAL: QUICK CHANGE ROLE
        ============================================================ */}
        {changeRoleUser && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl border border-[#e6eeff] w-full max-w-md p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff]">
                <div>
                  <h3 className="font-bold text-base text-[#121c2a]">Change Role</h3>
                  <p className="text-xs text-[#6d7980]">
                    Select a new role for <strong className="text-[#121c2a]">{changeRoleUser.name}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setChangeRoleUser(null)}
                  className="w-7 h-7 rounded-lg text-[#6d7980] hover:text-[#121c2a] hover:bg-[#eff4ff] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div className="py-4 space-y-2">
                {ROLES.map((role) => {
                  const detail = ROLE_DETAILS[role];
                  const isCurrent = changeRoleUser.role === role;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleConfirmChangeRole(role)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-[#eff4ff] border-[#00b7f1] ring-1 ring-[#00b7f1]'
                          : 'bg-white border-[#e2e8f0] hover:bg-[#f8fbfe] hover:border-[#cbd5e1]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#121c2a]">{role}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#004B87] text-white font-bold">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6d7980] mt-0.5 max-w-xs leading-relaxed">
                          {detail.description}
                        </p>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-[#004B87]">
                        {isCurrent ? 'check_circle' : 'chevron_right'}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-[#e6eeff] flex justify-end">
                <button
                  type="button"
                  onClick={() => setChangeRoleUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6d7980] hover:bg-[#eff4ff] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[#121c2a] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in">
            <span className="material-symbols-outlined text-[#22C55E]">check_circle</span>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
