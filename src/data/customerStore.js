// IntelliOnboard AI - Customer & Onboarding Shared Data Store
// Provides synchronized access to Customer Registry (Name, Code, JPower ID)
// and all Onboarding Projects with the 18 exact onboarding attributes.

// IntelliOnboard AI - Customer & Onboarding Shared Data Store
// Strictly configured for 15 demo customers (Customer 1 - Customer 15)
// Provides synchronized access to Customer Registry (Name, Code, JPower ID)
// and all Onboarding Projects with the exact 18 onboarding attributes.

export const DEMO_CUSTOMERS_LIST = Array.from({ length: 15 }, (_, i) => `Customer ${i + 1}`);

export const DEFAULT_CUSTOMER_REGISTRY = {
  'Customer 1': { customerName: 'Customer 1', customerCode: 'CUST-001', jpowerId: '44501' },
  'Customer 2': { customerName: 'Customer 2', customerCode: 'CUST-002', jpowerId: '44502' },
  'Customer 3': { customerName: 'Customer 3', customerCode: 'CUST-003', jpowerId: '44503' },
  'Customer 4': { customerName: 'Customer 4', customerCode: 'CUST-004', jpowerId: '44504' },
  'Customer 5': { customerName: 'Customer 5', customerCode: 'CUST-005', jpowerId: '44505' },
  'Customer 6': { customerName: 'Customer 6', customerCode: 'CUST-006', jpowerId: '44506' },
  'Customer 7': { customerName: 'Customer 7', customerCode: 'CUST-007', jpowerId: '44507' },
  'Customer 8': { customerName: 'Customer 8', customerCode: 'CUST-008', jpowerId: '44508' },
  'Customer 9': { customerName: 'Customer 9', customerCode: 'CUST-009', jpowerId: '44509' },
  'Customer 10': { customerName: 'Customer 10', customerCode: 'CUST-010', jpowerId: '44510' },
  'Customer 11': { customerName: 'Customer 11', customerCode: 'CUST-011', jpowerId: '44511' },
  'Customer 12': { customerName: 'Customer 12', customerCode: 'CUST-012', jpowerId: '44512' },
  'Customer 13': { customerName: 'Customer 13', customerCode: 'CUST-013', jpowerId: '44513' },
  'Customer 14': { customerName: 'Customer 14', customerCode: 'CUST-014', jpowerId: '44514' },
  'Customer 15': { customerName: 'Customer 15', customerCode: 'CUST-015', jpowerId: '44515' },
};

export const DEFAULT_ONBOARDING_PROJECTS = [
  // -------------------------------------------------------------
  // Customer 1 (Demonstrating 1-to-many: 3 onboarding projects)
  // -------------------------------------------------------------
  {
    id: 'c1-p1',
    customer: 'Customer 1',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'New Implementation',
    status: 'Completed',
    transitioned: 'Yes',
    implementationTeam: 'Global Core Services',
    version: '2025.1.0',
    projectL3: 'Alex Vance',
    location: 'Dallas, TX',
    secondarySme: 'David Ross',
    tShirtSize: 'Large',
    noOfSubscriptions: 16,
    platform: 'Azure Cloud',
    startDate: '2024-06-01',
    goLiveDate: '2025-05-15',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'DigiCert Cloud Wildcard',
    tam: 'Devon Vance',
  },
  {
    id: 'c1-p2',
    customer: 'Customer 1',
    projectNumber: 'Project 002',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Cloud Delivery Pod Alpha',
    version: '2026.2.0',
    projectL3: 'Sarah Jenkins',
    location: 'Dallas, TX',
    secondarySme: 'Tyler Chen',
    tShirtSize: 'Medium',
    noOfSubscriptions: 12,
    platform: 'BY Cloud',
    startDate: '2026-02-15',
    goLiveDate: '2026-11-30',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'Sectigo EV Cert',
    tam: 'Devon Vance',
  },
  {
    id: 'c1-p3',
    customer: 'Customer 1',
    projectNumber: 'Project 003',
    solution: 'Category Management',
    type: 'J2C',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'J2C Modernization Pod',
    version: '2026.3.0',
    projectL3: 'Elena Rostova',
    location: 'Dallas, TX',
    secondarySme: 'Marcus Brody',
    tShirtSize: 'Very Large',
    noOfSubscriptions: 24,
    platform: 'AWS',
    startDate: '2026-04-01',
    goLiveDate: '2027-01-15',
    supportPoc: 'Mark Sterling',
    sslPem: 'AWS ACM Cloud Cert',
    tam: 'Devon Vance',
  },

  // -------------------------------------------------------------
  // Customer 2 (2 projects)
  // -------------------------------------------------------------
  {
    id: 'c2-p1',
    customer: 'Customer 2',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Cloud Delivery Pod Beta',
    version: '2026.1.0',
    projectL3: 'Alex Vance',
    location: 'Atlanta, GA',
    secondarySme: 'Elena Rostova',
    tShirtSize: 'Large',
    noOfSubscriptions: 20,
    platform: 'Azure Cloud',
    startDate: '2025-10-01',
    goLiveDate: '2026-11-30',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'DigiCert Wildcard 2026',
    tam: 'Elena Rostova',
  },
  {
    id: 'c2-p2',
    customer: 'Customer 2',
    projectNumber: 'Project 002',
    solution: 'Category Management',
    type: 'J2C',
    status: 'Completed',
    transitioned: 'Yes',
    implementationTeam: 'J2C Modernization Pod',
    version: '2025.4.1',
    projectL3: 'Sarah Jenkins',
    location: 'Atlanta, GA',
    secondarySme: 'Marcus Brody',
    tShirtSize: 'Medium',
    noOfSubscriptions: 14,
    platform: 'BY Cloud',
    startDate: '2024-08-01',
    goLiveDate: '2025-06-30',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'Sectigo EV',
    tam: 'Elena Rostova',
  },

  // -------------------------------------------------------------
  // Customer 3 (2 projects)
  // -------------------------------------------------------------
  {
    id: 'c3-p1',
    customer: 'Customer 3',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'New Implementation',
    status: 'Completed',
    transitioned: 'Yes',
    implementationTeam: 'Global Core Services',
    version: '2025.2.0',
    projectL3: 'David Ross',
    location: 'Chicago, IL',
    secondarySme: 'Tyler Chen',
    tShirtSize: 'Large',
    noOfSubscriptions: 18,
    platform: 'BY Cloud',
    startDate: '2024-03-15',
    goLiveDate: '2025-01-15',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'Sectigo Cloud EV',
    tam: 'Devon Vance',
  },
  {
    id: 'c3-p2',
    customer: 'Customer 3',
    projectNumber: 'Project 002',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Strategic Cloud Pod',
    version: '2026.2.0',
    projectL3: 'Alex Vance',
    location: 'Chicago, IL',
    secondarySme: 'David Ross',
    tShirtSize: 'Very Large',
    noOfSubscriptions: 32,
    platform: 'AWS',
    startDate: '2025-11-01',
    goLiveDate: '2026-10-15',
    supportPoc: 'Mark Sterling',
    sslPem: 'AWS ACM Cloud Cert',
    tam: 'Devon Vance',
  },

  // -------------------------------------------------------------
  // Customer 4 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c4-p1',
    customer: 'Customer 4',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'J2C',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Core Migrations East',
    version: '2026.1.0',
    projectL3: 'Mark Sterling',
    location: 'Boise, ID',
    secondarySme: 'Elena Rostova',
    tShirtSize: 'Medium',
    noOfSubscriptions: 10,
    platform: 'Azure Cloud',
    startDate: '2026-01-05',
    goLiveDate: '2027-01-20',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'DigiCert Wildcard 2026',
    tam: 'Marcus Vance',
  },

  // -------------------------------------------------------------
  // Customer 5 (2 projects)
  // -------------------------------------------------------------
  {
    id: 'c5-p1',
    customer: 'Customer 5',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'New Implementation',
    status: 'Completed',
    transitioned: 'Yes',
    implementationTeam: 'Global Core Services',
    version: '2025.3.0',
    projectL3: 'David Ross',
    location: 'Cincinnati, OH',
    secondarySme: 'Tyler Chen',
    tShirtSize: 'Large',
    noOfSubscriptions: 22,
    platform: 'BY Cloud',
    startDate: '2024-09-01',
    goLiveDate: '2025-11-15',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'Entrust Cloud CA',
    tam: 'Devon Vance',
  },
  {
    id: 'c5-p2',
    customer: 'Customer 5',
    projectNumber: 'Project 002',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Cloud Delivery Pod Alpha',
    version: '2026.3.0',
    projectL3: 'David Ross',
    location: 'Cincinnati, OH',
    secondarySme: 'Sarah Jenkins',
    tShirtSize: 'Very Large',
    noOfSubscriptions: 35,
    platform: 'Azure Cloud',
    startDate: '2026-02-01',
    goLiveDate: '2027-02-28',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'DigiCert Wildcard 2026',
    tam: 'Devon Vance',
  },

  // -------------------------------------------------------------
  // Customer 6 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c6-p1',
    customer: 'Customer 6',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'J2C',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'EMEA Transition Pod',
    version: '2026.1.0',
    projectL3: 'Tyler Chen',
    location: 'London, UK',
    secondarySme: 'Alex Vance',
    tShirtSize: 'Small',
    noOfSubscriptions: 8,
    platform: 'BY Cloud',
    startDate: '2026-03-01',
    goLiveDate: '2026-11-15',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'GlobalSign AlphaSSL',
    tam: 'Elena Rostova',
  },

  // -------------------------------------------------------------
  // Customer 7 (2 projects)
  // -------------------------------------------------------------
  {
    id: 'c7-p1',
    customer: 'Customer 7',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Cloud Delivery Pod Beta',
    version: '2026.1.0',
    projectL3: 'Sarah Jenkins',
    location: 'Seattle, WA',
    secondarySme: 'David Ross',
    tShirtSize: 'Medium',
    noOfSubscriptions: 12,
    platform: 'Azure Cloud',
    startDate: '2025-12-01',
    goLiveDate: '2026-09-30',
    supportPoc: 'Mark Sterling',
    sslPem: 'DigiCert Wildcard 2026',
    tam: 'Marcus Vance',
  },
  {
    id: 'c7-p2',
    customer: 'Customer 7',
    projectNumber: 'Project 002',
    solution: 'Category Management',
    type: 'New Implementation',
    status: 'Completed',
    transitioned: 'Yes',
    implementationTeam: 'Global Core Services',
    version: '2024.4.0',
    projectL3: 'David Ross',
    location: 'Seattle, WA',
    secondarySme: 'Tyler Chen',
    tShirtSize: 'Small',
    noOfSubscriptions: 6,
    platform: 'BY Cloud',
    startDate: '2024-01-10',
    goLiveDate: '2024-11-20',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'Sectigo Cloud EV',
    tam: 'Marcus Vance',
  },

  // -------------------------------------------------------------
  // Customer 8 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c8-p1',
    customer: 'Customer 8',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'J2C',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'J2C Modernization Pod',
    version: '2026.2.0',
    projectL3: 'Elena Rostova',
    location: 'Denver, CO',
    secondarySme: 'Alex Vance',
    tShirtSize: 'Large',
    noOfSubscriptions: 16,
    platform: 'AWS',
    startDate: '2026-02-10',
    goLiveDate: '2026-12-15',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'AWS ACM Cloud Cert',
    tam: 'Elena Rostova',
  },

  // -------------------------------------------------------------
  // Customer 9 (2 projects)
  // -------------------------------------------------------------
  {
    id: 'c9-p1',
    customer: 'Customer 9',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'New Implementation',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Core Delivery Alpha',
    version: '2026.1.0',
    projectL3: 'Alex Vance',
    location: 'Boston, MA',
    secondarySme: 'Marcus Brody',
    tShirtSize: 'Large',
    noOfSubscriptions: 18,
    platform: 'BY Cloud',
    startDate: '2026-01-15',
    goLiveDate: '2026-10-31',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'DigiCert Wildcard 2026',
    tam: 'Devon Vance',
  },
  {
    id: 'c9-p2',
    customer: 'Customer 9',
    projectNumber: 'Project 002',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Strategic Cloud Pod',
    version: '2026.3.0',
    projectL3: 'Sarah Jenkins',
    location: 'Boston, MA',
    secondarySme: 'David Ross',
    tShirtSize: 'Medium',
    noOfSubscriptions: 10,
    platform: 'Azure Cloud',
    startDate: '2026-03-01',
    goLiveDate: '2027-01-15',
    supportPoc: 'Mark Sterling',
    sslPem: 'Sectigo EV Cert',
    tam: 'Devon Vance',
  },

  // -------------------------------------------------------------
  // Customer 10 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c10-p1',
    customer: 'Customer 10',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'J2C',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'J2C Modernization Pod',
    version: '2026.2.0',
    projectL3: 'Elena Rostova',
    location: 'Phoenix, AZ',
    secondarySme: 'Tyler Chen',
    tShirtSize: 'Very Large',
    noOfSubscriptions: 28,
    platform: 'BY Cloud',
    startDate: '2026-02-01',
    goLiveDate: '2026-11-30',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'Entrust Cloud CA',
    tam: 'Marcus Vance',
  },

  // -------------------------------------------------------------
  // Customer 11 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c11-p1',
    customer: 'Customer 11',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'Completed',
    transitioned: 'Yes',
    implementationTeam: 'Cloud Delivery Pod Beta',
    version: '2025.4.0',
    projectL3: 'David Ross',
    location: 'Miami, FL',
    secondarySme: 'Alex Vance',
    tShirtSize: 'Small',
    noOfSubscriptions: 6,
    platform: 'Azure Cloud',
    startDate: '2025-01-15',
    goLiveDate: '2025-10-30',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'DigiCert Wildcard 2025',
    tam: 'Elena Rostova',
  },

  // -------------------------------------------------------------
  // Customer 12 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c12-p1',
    customer: 'Customer 12',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'New Implementation',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Global Core Services',
    version: '2026.1.0',
    projectL3: 'Sarah Jenkins',
    location: 'Minneapolis, MN',
    secondarySme: 'Marcus Brody',
    tShirtSize: 'Medium',
    noOfSubscriptions: 12,
    platform: 'BY Cloud',
    startDate: '2026-01-20',
    goLiveDate: '2026-12-10',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'Sectigo EV Cert',
    tam: 'Devon Vance',
  },

  // -------------------------------------------------------------
  // Customer 13 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c13-p1',
    customer: 'Customer 13',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'J2C',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'J2C Modernization Pod',
    version: '2026.3.0',
    projectL3: 'Mark Sterling',
    location: 'Charlotte, NC',
    secondarySme: 'Tyler Chen',
    tShirtSize: 'Large',
    noOfSubscriptions: 20,
    platform: 'AWS',
    startDate: '2026-03-15',
    goLiveDate: '2027-02-15',
    supportPoc: 'Mark Sterling',
    sslPem: 'AWS ACM Cloud Cert',
    tam: 'Marcus Vance',
  },

  // -------------------------------------------------------------
  // Customer 14 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c14-p1',
    customer: 'Customer 14',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'Upgrade',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Strategic Cloud Pod',
    version: '2026.2.0',
    projectL3: 'Alex Vance',
    location: 'Philadelphia, PA',
    secondarySme: 'Elena Rostova',
    tShirtSize: 'Very Small',
    noOfSubscriptions: 4,
    platform: 'Azure Cloud',
    startDate: '2026-02-15',
    goLiveDate: '2026-09-15',
    supportPoc: 'Rachel Adams (Tier 1)',
    sslPem: 'DigiCert Wildcard 2026',
    tam: 'Devon Vance',
  },

  // -------------------------------------------------------------
  // Customer 15 (1 project)
  // -------------------------------------------------------------
  {
    id: 'c15-p1',
    customer: 'Customer 15',
    projectNumber: 'Project 001',
    solution: 'Category Management',
    type: 'New Implementation',
    status: 'In Progress',
    transitioned: 'No',
    implementationTeam: 'Core Delivery Alpha',
    version: '2026.1.0',
    projectL3: 'David Ross',
    location: 'San Diego, CA',
    secondarySme: 'Sarah Jenkins',
    tShirtSize: 'Large',
    noOfSubscriptions: 16,
    platform: 'BY Cloud',
    startDate: '2026-01-10',
    goLiveDate: '2026-11-20',
    supportPoc: 'Vikram Patel (Premier)',
    sslPem: 'Entrust Cloud CA',
    tam: 'Elena Rostova',
  },
];

// Helper: load customer metadata with localStorage persistence
export const loadCustomerRegistry = () => {
  try {
    const saved = localStorage.getItem('intellionboard_customer_registry');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CUSTOMER_REGISTRY, ...parsed };
    }
  } catch {}
  return { ...DEFAULT_CUSTOMER_REGISTRY };
};

// Helper: save updated customer metadata
export const saveCustomerMeta = (customerName, meta) => {
  try {
    const current = loadCustomerRegistry();
    current[customerName] = {
      customerName,
      customerCode: meta.customerCode || 'B802',
      jpowerId: meta.jpowerId || '44562',
    };
    localStorage.setItem('intellionboard_customer_registry', JSON.stringify(current));
    return current[customerName];
  } catch {
    return {
      customerName,
      customerCode: meta.customerCode || 'B802',
      jpowerId: meta.jpowerId || '44562',
    };
  }
};

// Helper: get customer meta for a specific customer
export const getCustomerMeta = (customerName) => {
  if (!customerName) {
    return {
      customerName: 'Customer 1',
      customerCode: 'B801',
      jpowerId: '44501',
    };
  }

  const registry = loadCustomerRegistry();
  if (registry[customerName]) {
    return registry[customerName];
  }

  // Generate deterministic code and JPower ID if not present
  const safeName = customerName.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const generated = {
    customerName,
    customerCode: `CUST-${safeName.slice(0, 4) || '802'}`,
    jpowerId: `JPW-${Math.abs(hashString(customerName)) % 90000 + 10000}`,
  };

  // Cache in registry
  saveCustomerMeta(customerName, generated);
  return generated;
};

// Helper: Simple string hash for consistent fallback IDs
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Helper: load all onboarding projects with localStorage persistence
export const loadOnboardingProjects = () => {
  try {
    const saved = localStorage.getItem('intellionboard_onboarding_projects_ledger');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return [...DEFAULT_ONBOARDING_PROJECTS];
};

// Helper: save all onboarding projects
export const saveOnboardingProjects = (projects) => {
  try {
    localStorage.setItem(
      'intellionboard_onboarding_projects_ledger',
      JSON.stringify(projects)
    );
  } catch {}
};
