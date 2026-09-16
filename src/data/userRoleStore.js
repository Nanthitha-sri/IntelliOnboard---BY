// Centralized User Management and Role-Based Access Control (RBAC) Store

export const ROLES = [
  'Admin User',
  'Power User',
  'SME User',
  'Edit Sheet User',
  'Read-only User',
  'No Role',
];

export const ROLE_DETAILS = {
  'Admin User': {
    title: 'Admin User',
    badgeClass: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
    description: 'Full application access. Can create, edit and manage users and roles.',
    canManageUsers: true,
    canCreateOB: true,
    canEditAllSheets: true,
    canEditAssignedOnly: false,
    isReadOnly: false,
    hasAccess: true,
  },
  'Power User': {
    title: 'Power User',
    badgeClass: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
    description: 'Full operational access. Cannot create or manage users.',
    canManageUsers: false,
    canCreateOB: true,
    canEditAllSheets: true,
    canEditAssignedOnly: false,
    isReadOnly: false,
    hasAccess: true,
  },
  'SME User': {
    title: 'SME User',
    badgeClass: 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]',
    description: 'Can access the application and edit customer information only for customers assigned to them.',
    canManageUsers: false,
    canCreateOB: false,
    canEditAllSheets: false,
    canEditAssignedOnly: true,
    isReadOnly: false,
    hasAccess: true,
  },
  'Edit Sheet User': {
    title: 'Edit Sheet User',
    badgeClass: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
    description: 'Can edit permitted onboarding/server sheet data.',
    canManageUsers: false,
    canCreateOB: false,
    canEditAllSheets: true,
    canEditAssignedOnly: false,
    isReadOnly: false,
    hasAccess: true,
  },
  'Read-only User': {
    title: 'Read-only User',
    badgeClass: 'bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]',
    description: 'Can view permitted information but cannot edit or create records.',
    canManageUsers: false,
    canCreateOB: false,
    canEditAllSheets: false,
    canEditAssignedOnly: false,
    isReadOnly: true,
    hasAccess: true,
  },
  'No Role': {
    title: 'No Role',
    badgeClass: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
    description: 'No access to the application.',
    canManageUsers: false,
    canCreateOB: false,
    canEditAllSheets: false,
    canEditAssignedOnly: false,
    isReadOnly: true,
    hasAccess: false,
  },
};

export const APP_AREAS = [
  'Dashboard',
  'Start New OB',
  'Customer Onboarding',
  'Customer Details',
  'Server Details',
  'Talk with OB',
  'Learn',
  'Settings',
];

export const PERMISSION_TYPES = ['View', 'Edit', 'Create', 'Manage Users'];

// Master Permission Matrix Definition
export const PERMISSION_MATRIX = {
  'Dashboard': {
    'Admin User': ['View', 'Edit', 'Create', 'Manage Users'],
    'Power User': ['View', 'Edit', 'Create'],
    'SME User': ['View', 'Edit'],
    'Edit Sheet User': ['View', 'Edit'],
    'Read-only User': ['View'],
    'No Role': [],
  },
  'Start New OB': {
    'Admin User': ['View', 'Edit', 'Create'],
    'Power User': ['View', 'Edit', 'Create'],
    'SME User': ['View'],
    'Edit Sheet User': ['View'],
    'Read-only User': [], // Hidden/Unavailable
    'No Role': [],
  },
  'Customer Onboarding': {
    'Admin User': ['View', 'Edit', 'Create'],
    'Power User': ['View', 'Edit', 'Create'],
    'SME User': ['View', 'Edit'], // Edit only for assigned customers
    'Edit Sheet User': ['View', 'Edit'],
    'Read-only User': ['View'],
    'No Role': [],
  },
  'Customer Details': {
    'Admin User': ['View', 'Edit', 'Create'],
    'Power User': ['View', 'Edit', 'Create'],
    'SME User': ['View', 'Edit'], // Edit only for assigned customers
    'Edit Sheet User': ['View', 'Edit'],
    'Read-only User': ['View'],
    'No Role': [],
  },
  'Server Details': {
    'Admin User': ['View', 'Edit', 'Create'],
    'Power User': ['View', 'Edit', 'Create'],
    'SME User': ['View', 'Edit'], // Edit only for assigned customers
    'Edit Sheet User': ['View', 'Edit'],
    'Read-only User': ['View'],
    'No Role': [],
  },
  'Talk with OB': {
    'Admin User': ['View'],
    'Power User': ['View'],
    'SME User': ['View'],
    'Edit Sheet User': ['View'],
    'Read-only User': ['View'],
    'No Role': [],
  },
  'Learn': {
    'Admin User': ['View'],
    'Power User': ['View'],
    'SME User': ['View'],
    'Edit Sheet User': ['View'],
    'Read-only User': ['View'],
    'No Role': [],
  },
  'Settings': {
    'Admin User': ['View', 'Edit', 'Create', 'Manage Users'],
    'Power User': [], // Hidden from navigation; User Management is Admin only
    'SME User': [],
    'Edit Sheet User': [],
    'Read-only User': [],
    'No Role': [],
  },
};

// Default Users (No fake departments or employee IDs)
export const DEFAULT_USERS = [
  {
    id: 'usr-1',
    name: 'JDA Delivers Admin',
    email: '12345@jdadelivers.com',
    role: 'Admin User',
    assignedCustomers: ['All Customers'],
    status: 'Active',
  },
  {
    id: 'usr-legacy-test',
    name: 'Test User',
    email: 'test.user@blueyonder.com',
    role: 'Admin User',
    assignedCustomers: ['All Customers'],
    status: 'Active',
  },
  {
    id: 'usr-2',
    name: 'Elena Rostova',
    email: 'elena.rostova@blueyonder.com',
    role: 'Power User',
    assignedCustomers: ['All Customers'],
    status: 'Active',
  },
  {
    id: 'usr-3',
    name: 'Alex Vance',
    email: 'alex.vance@blueyonder.com',
    role: 'SME User',
    assignedCustomers: ['Customer 1', 'Customer 2', 'Customer 3'],
    status: 'Active',
  },
  {
    id: 'usr-4',
    name: 'Marcus Brody',
    email: 'marcus.brody@blueyonder.com',
    role: 'Edit Sheet User',
    assignedCustomers: ['Customer 1', 'Customer 4', 'Customer 5'],
    status: 'Active',
  },
  {
    id: 'usr-5',
    name: 'Rachel Adams',
    email: 'rachel.adams@blueyonder.com',
    role: 'Read-only User',
    assignedCustomers: ['All Customers'],
    status: 'Active',
  },
  {
    id: 'usr-6',
    name: 'Devon Vance',
    email: 'devon.vance@blueyonder.com',
    role: 'SME User',
    assignedCustomers: ['Customer 5', 'Customer 6', 'Customer 7'],
    status: 'Active',
  },
  {
    id: 'usr-7',
    name: 'External Auditor',
    email: 'auditor.compliance@partner.com',
    role: 'No Role',
    assignedCustomers: [],
    status: 'Inactive',
  },
];

const USERS_STORAGE_KEY = 'intellionboard_users_v2';
const ACTIVE_USER_KEY = 'intellionboard_active_user_v2';

export const loadUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load users from localStorage:', e);
  }
  return DEFAULT_USERS;
};

export const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage:', e);
  }
};

export const loadActiveUser = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load active user from localStorage:', e);
  }
  return DEFAULT_USERS[0]; // Test User (Admin User)
};

export const saveActiveUser = (user) => {
  try {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save active user to localStorage:', e);
  }
};

// Check if user has permission in a specific area
export const hasAreaPermission = (role, area, permission = 'View') => {
  if (!role || role === 'No Role') return false;
  const areaPerms = PERMISSION_MATRIX[area]?.[role] || [];
  return areaPerms.includes(permission);
};

// Check if SME or general user can edit specific customer
export const canEditCustomerRecord = (user, customerName) => {
  if (!user || user.role === 'No Role') return false;
  if (user.role === 'Read-only User') return false;
  if (user.role === 'Admin User' || user.role === 'Power User' || user.role === 'Edit Sheet User') {
    return true;
  }
  if (user.role === 'SME User') {
    if (!user.assignedCustomers || user.assignedCustomers.length === 0) return false;
    if (user.assignedCustomers.includes('All Customers')) return true;
    return user.assignedCustomers.includes(customerName);
  }
  return false;
};
